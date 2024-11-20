<script lang="ts">
	import type { Scorecard } from "graperank-nodejs/src/types";
	import type { Writable } from "svelte/store";
	import { ndk } from "$lib/stores/ndk.store";
	import { getRelayListForUsers, NDKEvent, NDKRelay, NDKRelaySet, normalize, type NostrEvent } from "@nostr-dev-kit/ndk";
	import { forEachBigArray } from "graperank-nodejs/src/utils";
	import { onMount } from "svelte";

  export let scorecards : Writable<Scorecard[]>
  export let context : string

  // NIP 51 :
  // Kind 30000 = Follow List
  // Kind 30007 = Mute List
  let listkinds = [30000,30007]
  let maxpublishlength = 1000
  let published : Map<string,NDKEvent>
  let publishedto : Promise<Set<NDKRelay>>
  let modalopen = true
  let defaulttitle = "Grapevine Demo Custom List"
  let defaultdescription = "A generated list of pubkeys and associated WoT Scores as calculated by My Grapevine. Get your custom lists at grapevine.my"

  let input = {
    overwrite : '',
    asmutelist : false,
    title : defaulttitle,
    description : defaultdescription,
    id : ''
  }

  function updateinput(){
    if(input.overwrite){
      let publishedevent = published.get(input.overwrite)
      input.title = getTagValue(publishedevent,'title') || input.title
      input.description = getTagValue(publishedevent,'description') || input.description
      input.asmutelist = publishedevent?.kind == listkinds[1] ? true : false
    }else{
      input.title = defaulttitle
      input.description = defaultdescription
    }
    updateId()
  }

  // returns a map of events indexed by id
  async function fetchPublished() : Promise<void> {
      published = new Map()
      if($ndk.activeUser){
        // fetch events from this author
        await $ndk.fetchEvents({
          authors : [$ndk.activeUser.pubkey],
          kinds : listkinds
        }).then((results)=>{
          // check that each event was created by this client
          results.forEach((event)=>{
            event.tags.some((tag)=>{
              // if one 'd' tag startswith 'grapevine' 
              if(tag[0] == 'd' && tag[1].startsWith('grapevine')){
                // add event to map
                published.set(event.id, event)
                // break the loop for this event
                return true
              }
            })
          })
          console.log('GrapeVine : demo export : fetched ',published.size,' published lists.')
        })
      }
  }

  // FIXME publishing is not working
  // throws : `NDKPublishError: Not enough relays received the event`
  async function publish(){
    if(!$ndk.activeUser) return
    let pubkey = $ndk.activeUser.pubkey
    // compose new event
    const event = new NDKEvent($ndk,{
      pubkey,
      kind : input.asmutelist ? 30007 : 30000,
      created_at : new Date().getTime() / 1000,
      content : '',
      tags : [
        ['d', input.id],
        ['title', input.title],
        ['description',  input.description]
      ]
    })
    // add a p tag for each scorecard (up to max) using big array function
    await forEachBigArray($scorecards.slice(0,maxpublishlength), (scorecard) => {
      event.tags.push([
        'p', // insert a new p tag
        scorecard.subject as string, // index [1] is pubkey
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
    // 'technically' the user's published list of 'prefered relays' 
    // will be fetched by NDK when calling event.publish()... 
    // but we go ahead and fetch the list here to help with debuging :
    await getRelayListForUsers([pubkey], $ndk).then((relayMap)=>{
      let relayset : Set<NDKRelay> = new Set();
      let relayUrls = normalize(relayMap.get(pubkey)?.writeRelayUrls || [])
      relayUrls.forEach((relayurl,index)=> {
        let relay = $ndk.pool?.getRelay(relayurl)
        // DEBUG confirm each relay is connected
        if (relay.connected) {
          relayset.add(relay)
          // DEBUG log connection info about each relay ... BEFORE publish attemmpt
          console.log('GrapeVine : demo export : attempt publishing to relay : ', relay.url, relay.connected, relay.status, relay.connectionStats)
        }
      })
      // call publish with relaySet AND store promise as a variable
      // so that svelte HTML (bellow) can react when promise is fulfilled
      publishedto = event.publish(new NDKRelaySet(relayset, $ndk))
      // this error will be output to console AFTER publish attempt
      publishedto.catch((e) => console.log('GrapeVine : publishing failed : ', e))
    })
  }


  function getTagValue(event? : NDKEvent | NostrEvent, tagid? : string, index = 1){
    if(!event) return ''
    let tag = event.tags.find((tag)=> tagid ? tag[0] == tagid : false) || []
    return tag[index] || ''
  }

  // grapevine-[title-as-slug]-[pubkey]
  function updateId(){
    input.id = input.overwrite || 
      'grapevine-'
      + input.title.replace(/^[G,g]rapevine/,'').trim().replaceAll(' ','-').toLowerCase()
      + '-'+$ndk.activeUser?.pubkey  
    updateOverwrite()
  }

  function updateOverwrite(){
    if(input.overwrite != input.id && published.has(input.id)){
      input.overwrite = input.id
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



<h2 class="text-xl py-3">Publish your list to Nostr.</h2>
<p>Adust for filters and sorting (in the other tabs) to configure your custom list for export. Publish as a Nostr (NIP 51) list bellow. Come back here and re-pubblish the same list (with updated results) any time youi like.</p>
<br>
<h3 class="text-lg pb-3">Use your published lists as : </h3>
<ul class="steps steps-vertical">
  <li class="step"  data-content="✓">a custom feed or mute list in your favorite client.</li>
  <li class="step"  data-content="✓">a whitelist or blacklist for your personal relay.</li>
  <li class="step"  data-content="✓">a listr list with MANY other uses on Nostr.</li>
</ul>

<hr class="my-5">

<br>

{#if published?.size}
<label class="form-control w-full">
  <span class="label-text">OPTIONALLY overwrite a published list :</span>
  <select class="select select-bordered w-full {input.overwrite ? 'text-primary' : ''}" bind:value={input.overwrite}  on:change={updateinput}>
    <option value='' selected>
      {input.overwrite ? 'Unset choice' : 'Choose a published list to overwrite'}
    </option>
		{#each published as entry}
      <option value={entry[0]}> {getTagValue(entry[1],'title')} &nbsp;&nbsp; ({entry[1].tags.length} entries)</option>
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
  bind:value={input.title} on:keyup={updateId}/>
  <div class="label">
    <span class="label-text-alt text-ghost text-xs text-right max-w-full px-3 text-[#999]" style="word-break: break-all;">d tag : {input.id}</span>
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
{#await publishedto then relays}
<!-- Open the modal using ID.showModal() method -->
<dialog id="my_modal_1" class="modal {modalopen ? 'modal-open' : ''}">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Success!</h3>
    <p class="py-4">Your list has been published to {relays?.size} relays. View yiour list on <a href="https://listr.lol/{$ndk.activeUser?.npub}" target="_blank">listr.lol</a>.</p>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn" on:click={() => modalopen = false}>OK</button>
      </form>
    </div>
  </div>
</dialog>
{/await}
{/if}