<script lang="ts">
	import type { Scorecard } from "graperank-nodejs/src/types";
	import type { Writable } from "svelte/store";
	import { ndk } from "$lib/stores/ndk.store";
	import { getRelayListForUsers, NDKEvent, NDKRelay, NDKRelaySet, normalize, type NostrEvent } from "@nostr-dev-kit/ndk";
	import { forEachBigArray } from "graperank-nodejs/src/utils";
	import { onMount } from "svelte";
	import { npubEncode, validatePubkey } from "$lib/utils/user";
  import { naddrEncode } from "nostr-tools/nip19";

  export let scorecards : Writable<Scorecard[]>
  export let context : string

  // NIP 51 :
  // Kind 30000 = Follow List
  // Kind 30007 = Mute List
  let listkinds = [30000,30007]
  let maxpublishlength = 500
  let publishedlength = Math.min(maxpublishlength, $scorecards.length)
  let event : NDKEvent
  let published : NDKEvent[]
  let publishedto : Promise<Set<NDKRelay>>
  let modalopen = true
  let defaulttitle = "Grapevine Demo Custom List"
  let defaultdescription = "A generated list of pubkeys and associated WoT Scores as calculated by My Grapevine. Get your custom lists at grapevine.my"
  let pubkey : string
  let naddr : string

  let input = {
    overwrite : '',
    asmutelist : false,
    title : defaulttitle,
    description : defaultdescription,
    dtag : ''
  }


  function updateinput(){
    if(input.overwrite){
      let publishedevent = getInputPublished()
      input.title = getTagValue(publishedevent,'title') || input.title
      input.description = getTagValue(publishedevent,'description') || input.description
      input.asmutelist = publishedevent?.kind == listkinds[1] ? true : false
    }else{
      input.title = defaulttitle
      input.description = defaultdescription
    }
    updateDtag()
  }

  // returns a map of events indexed by id
  async function fetchPublished() : Promise<void> {
      published = []
      if($ndk.activeUser){
        // fetch events from this author
        await $ndk.fetchEvents({
          authors : [$ndk.activeUser.pubkey],
          kinds : listkinds
        }).then((results)=>{
          // check that each event was created by this client
          results.forEach((event)=>{
            // if 'd' tag startswith 'grapevine' add event to published
            if(event.dTag?.startsWith('grapevine')) published.push(event)
          })
          console.log('GrapeVine : demo export : fetched ',published.length,' published lists.')
        })
      }
  }

  // DEBUG : `NDKPublishError: Not enough relays received the event`
  async function publish(){
    if(!$ndk.activeUser) return
    pubkey = $ndk.activeUser.pubkey
    let kind = getInputKind()
    // compose new event
    event = new NDKEvent($ndk,{
      pubkey,
      kind,
      created_at : Math.floor(new Date().getTime() / 1000),
      content : '',
      tags : [
        ['d', input.dtag],
        ['title', input.title],
        ['description',  input.description]
      ]
    })
    // add a p tag for each scorecard (up to max) using big array function
    await forEachBigArray($scorecards.slice(0,maxpublishlength), (scorecard) => {
      let followpubkey = (scorecard.subject as string).trim()
      // pubkey SHOULD be verified in GrapeRank engine ... during nostr interpretation
      // BUT it IS tecnically possible to generate a scorecard without validating 
      // that `subject` is-a `pubkey` ... therefore we validate again before publising
      if(validatePubkey(followpubkey))
      event.tags.push([
        'p', // insert a new p tag
        followpubkey, // index [1] is pubkey
        '', // index [2] is typically a relay url, as per NIP 01
        '', // index [3] MIGHT be a petname, as per NIP 02
        // add WoT score (0 - 100) to index [4]
        Math.round((scorecard.score || 0 ) * 100) as unknown as string, 
        // add confidence (0 -100) to index [5]
        Math.round((scorecard.confidence || 0) * 100) as unknown as string, 
        // add context string to index [6]
        context || ''
      ]) 
    })

    console.log('GrapeVine : demo export : signing event with ',event.tags.length,' tags.')
    // FIXME event.sign() obliterates dTag value
    await event.sign()

    // publishedto = event.publish()
    // DEBUG 'technically' the user's published list of 'prefered relays' 
    // will be fetched by NDK when calling event.publish()... 
    // but we go ahead and fetch the list here to help with debuging :
    publishedto = new Promise( async (resolve)=>{
      const relayset : Set<NDKRelay> = new Set();
      const relaymap = await getRelayListForUsers([pubkey], $ndk)
      const relayurls = normalize(relaymap.get(pubkey)?.writeRelayUrls || [])
      console.log('GrapeVine : demo export : found ',relayurls.length,' relays for publishing to.')
      // loop through relayUrls to build relayset
      for(let i in relayurls){
        let relay = $ndk.pool?.getRelay(relayurls[i])
        if (relay?.connected) {
          // DEBUG log connection info about each relay ... BEFORE publish attemmpt
          console.log('GrapeVine : demo export : attempt publishing to relay : ', relay.url, relay.connected, relay.status, relay.connectionStats)
          // relayset.add(relay)
          // DEBUG 'normally' we would pass relayset to event.publish() to cache event ect...
          // but calling relay.publish() for each relay allows to log relay error message
          await relay.publish(event)
            .then((success)=> {
                console.log('GrapeVine : success published to relay : ', relay.url, event.rawEvent())
                relayset.add(relay) 
            })
            .catch((e)=> { 
              console.log('GrapeVine : failed publishing to relay : ', relay.url, e, event.rawEvent())
              delete relayurls[i]
            })
        }else{
          // DEBUG log if relay is not connected
          console.log('GrapeVine : demo export : user relay is not connected : ', relay.url, relay.connected, relay.status, relay.connectionStats)
        }
      }

      // // call publish with relaySet AND store promise as a variable
      // // so that svelte HTML (bellow) can react when promise is fulfilled
      // return event.publish(new NDKRelaySet(relayset, $ndk))
      // DEBUG return relayset as constructed above
      if(!relayset.size) throw('no relays accepted this event')
      resolve(relayset)

      naddr = naddrEncode({
        identifier: input.dtag,
        pubkey,
        kind : getInputKind(),
        relays: relayurls
      })
    })
    // this error will be output to console AFTER publish attempt
    publishedto.catch((e) => console.log('GrapeVine : publishing failed : ', e))
  }


  function getInputKind(){ return input.asmutelist ? 30007 : 30000 }

  function getInputPublished() {
    return published.find((e) => 
      e.kind == getInputKind() && e.dTag == input.overwrite)
  }

  function getTagValue(event? : NDKEvent | NostrEvent, tagid? : string, index = 1){
    if(!event) return ''
    let tag = event.tags.find((tag)=> tagid ? tag[0] == tagid : false) || []
    return tag[index] || ''
  }

  // grapevine-[title-as-slug] //-[pubkey]
  function updateDtag(){
    input.dtag = input.overwrite || 
      'grapevine-'
      + input.title.replace(/^[G,g]rapevine/,'').trim().replaceAll(' ','-').toLowerCase()
      // + '-'+$ndk.activeUser?.pubkey  
    updateOverwrite()
  }

  function updateOverwrite(){
    if(input.overwrite != input.dtag && getInputPublished()){
      input.overwrite = input.dtag
    }
  }

  onMount(async ()=>{
    await fetchPublished()
    updateinput()
  })
</script>


<div class="mt-[-10px] mr-10 text-right text-sm">
  <span>Filtered list = {$scorecards.length} entries.</span><br>
  {#if $scorecards.length > maxpublishlength }
  <span class="text-error text-xs">Exported list will be truncated to {maxpublishlength} entries</span><br>
  {/if}
</div>



<h2 class="text-xl py-3">Publish your filtered results to Nostr.</h2>
<p>Configure your Nostr list for export by adusting the filters and sorting in the other tabs. Publish your results as a Nostr (NIP 51) list wiith the settings bellow. Come back here and re-pubblish the same list (with updated results) any time youi like.</p>
<br>
<h3 class="text-lg pb-3">Use your published list : </h3>
<ul class="steps steps-vertical">
  <li class="step"  data-content="✓">as a custom feed in your favorite client.</li>
  <li class="step"  data-content="✓">as a whitelist for your personal WoT relay.</li>
  <li class="step"  data-content="✓">as a listr list with MANY other uses on Nostr.</li>
</ul>

<hr class="my-5">

<br>

{#if published?.length > 0}
<label class="form-control w-full">
  <span class="label-text">OPTIONALLY overwrite a published list :</span>
  <select class="select select-bordered w-full {input.overwrite ? 'text-primary' : ''}" bind:value={input.overwrite}  on:change={updateinput}>
    <option value='' selected>
      {input.overwrite ? 'Unset choice' : 'Choose a published list to overwrite'}
    </option>
		{#each published as event}
      <option value={event.dTag}> {getTagValue(event,'title')} &nbsp;&nbsp; ({event.getMatchingTags('p').length} entries)</option>
		{/each}
	</select>
</label>
{/if}

<br>
<div class="form-control w-full">
  <label class="label cursor-pointer">
    <span class="label-text">List Type : </span>
    <span class="label-text">{input.asmutelist ? 'Mute List' : 'Follow List'}</span>
    <input type="checkbox" disabled={!!input.overwrite} class="toggle toggle-secondary" bind:checked={input.asmutelist} />
  </label>
</div>
<br/>
<label class="form-control w-full">
  <div class="label">
    <span class="label-text">List Title : </span>
    <span class="label-text-alt text-primary">{input.overwrite ? 'overwrite' : ''}</span>
  </div>
  <input type="text" class="input input-bordered w-full" placeholder="Title" 
  bind:value={input.title} on:keyup={updateDtag}/>
  <div class="label">
    <span class="label-text-alt text-ghost text-xs text-right max-w-full px-3 text-[#999]" style="word-break: break-all;">d tag : {input.dtag}</span>
  </div>
</label>
<br/>
<label class="form-control w-full">
  <div class="label">
    <span class="label-text">List Description : </span>
    <span class="label-text-alt text-primary">{input.overwrite ? 'overwrite' : ''}</span>
  </div>  
  <textarea class="textarea textarea-bordered w-full h-32" placeholder="Description" 
  bind:value={input.description} ></textarea>
</label>
<br>
<label>
  <button class="btn btn-xl btn-primary text-xl" on:click={publish}>Publish</button>
</label>

{#if publishedto}
<dialog id="my_modal_1" class="modal {modalopen ? 'modal-open' : ''}">
  {#await publishedto}
  <div class="modal-box">
    <h3 class="text-lg font-bold">Publishing to Nostr <span class="loading loading-dots loading-sm"></span></h3>
  </div>
  {:then relays}
<!-- Open the modal using ID.showModal() method -->
  <div class="modal-box">
    <h3 class="text-lg font-bold">Success!</h3>
    <p class="py-4">Your list has been published to {relays?.size} relays. View yiour list on <a href="https://listr.lol/{$ndk.activeUser?.npub}" target="_blank">listr.lol</a>.</p>
    <div class="p-3">
      <h4 class="text-xl underline">
        <a href="https://listr.lol/{$ndk.activeUser?.npub}/{event.kind}/{naddr}" target="_blank">
          {input.title}</a>
      </h4>
      <p class="text-sm">{publishedlength} users</p>
      <p class="text-xs text-[#999]">kind : {event.kind}</p><br>
      <p class="text-xs text-[#999]">d tag : {event.dTag}</p>
      <p class="text-xs text-[#999]">created_at : {event.created_at}</p>
    </div>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn" on:click={() => modalopen = false}>OK</button>
      </form>
    </div>
  </div>
{/await}
</dialog>
{/if}