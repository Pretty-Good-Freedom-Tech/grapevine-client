
<script lang="ts">
	import ScorecardsAccordion from "$lib/components/scorecards-accordion.svelte";
	import ScorecardsExport from "$lib/components/scorecards-export.svelte";
	import ScorecardsFilter from "$lib/components/scorecards-filter.svelte";
	import { loadNDK, ndk } from "$lib/stores/ndk.store";
	import { countScorecardsByScore, fetchScorecards, fetchWorldview, type scorecardsummary } from "$lib/utils/scorecards";
  import NDK, {NDKNip07Signer , NDKUser, type NDKUserProfile} from "@nostr-dev-kit/ndk";
  import type { Scorecard, Worldview } from "graperank-nodejs/src/types";
	import { onMount } from "svelte";
	import { writable } from "svelte/store";

  const DEMO_CONTEXT = "grapevine-web-of-trust-demo"
  const defaultAvatarUrl = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"

  let scorecardspromise : Promise<Scorecard[] | undefined>
  let profilepromise : Promise<NDKUserProfile | null>
  let worldviewpromise : Promise<Worldview | undefined>
  let worldview : Worldview | undefined
  let scorecards : Scorecard[]
  let filtered = writable<Scorecard[]>()
  let filtering = writable<boolean>()

  // filtered.subscribe(()=>{ rerender = !rerender })

  let recalculate : boolean | undefined
  let numcards : number
  $: numcards = 0
  let cardsMB : number
  $: cardsMB = 0
  let calculationtime : number
  $: calculationtime = 0
  let demouser : NDKUser | undefined
  $: demouser = undefined
  let summary : scorecardsummary
  $: summary = []
  let summarizefiltered = false
  function summarize(){
    summary = summarizefiltered 
      ? countScorecardsByScore($filtered) 
      : countScorecardsByScore(scorecards)
  }

  onMount(async ()=>{
    loginDemo()
  })
 
 async function loginDemo(){
  let connected = await loadNDK({signer : new NDKNip07Signer()})
  if(connected) {
    demouser = await $ndk.signer?.user()
    if(demouser) {
      profilepromise = demouser.fetchProfile()
      worldviewpromise = fetchWorldview(demouser.pubkey)
      worldviewpromise.then((result)=> {
        worldview = result
        console.log('fetched worldview : ',result)
      })
    }
  }
  return 
 }

 async function calculateScorecards(rc? : boolean){
  recalculate = rc 
  if(!demouser) return false
  calculationtime = Date.now()
  scorecardspromise = fetchScorecards(demouser.pubkey, undefined, recalculate)
  scorecardspromise.then((scorecardstorage)=>{
    if(scorecardstorage){
      scorecards = scorecardstorage
      filtered.set(scorecards)
      summarize()
      numcards = scorecards.length
      cardsMB = new TextEncoder().encode(JSON.stringify(scorecards)).length  / 1024 / 1024;
      calculationtime = (Date.now() - calculationtime) * .001
    }
  })

  return true
}

function latestCalculationTime(worldview : Worldview){
  if(!worldview.grapevines?.length) return
  let timestamp = worldview.grapevines[0].timestamp
  let diference = Date.now() - timestamp
  let daysago = diference /1000 /60 /60 /24
  return daysago > 1 ? Math.round(daysago) + " days ago" : daysago == 1 ? "yesterday" : "earlier today"
  // let datetime = new Date(worldview.grapevines[0].timestamp)
  // if(isNaN(datetime.valueOf())) 
  //   return worldview.grapevines[0].timestamp
  // return datetime.toString()
}

</script>

<div class="text-center absolute top-0 right-0 m-3"><span class="badge badge-primary badge-outline badge-lg p-4 mb-3">DEMO</span></div>

<section class="p-5 relative">

  {#if !demouser}
  <p class="text-lg p-5">Login with Nostr extention to launch the demo </p>
  <button class="btn btn-info text-xl" on:click={loginDemo}>Login</button>
  {/if}


  {#if demouser && profilepromise}

  {#await profilepromise then profile}
  <div class="flex items-center gap-3 p-5 mb-10 w-full">
    <div class="avatar w-32">
      <div class="rounded-full w-24 ring-2 ring-info ring-offset-4 ring-offset-purple-900">
        <img src={profile?.image || defaultAvatarUrl} alt="avatar" />
      </div>
    </div> 

    <div class="grow h-24">
      <div class="text-xl font-bold">{profile?.name || profile?.username}</div>
      <div class="text-lg opacity-50">{profile?.nip05}</div>
      <div class="text-md opacity-30">{demouser.npub.slice(0,24)}...</div>
    </div>
  </div>
  {/await}

  <div class="flex justify-between">
    <h2 class="text-2xl ">GrapeVine Web of Trust</h2>
    {#if scorecards?.length}
    <button class="btn btn-sm btn-info text-right" on:click={() => calculateScorecards(true)}>Recalculate</button>
    {/if}
  </div>
  <hr class="p-3">


  {#if !scorecardspromise}
  {#await worldviewpromise}
    Fetching calculations ...
  {:then}
    {#if worldview && worldview.grapevines?.length}
    Your Grapevine was last calculated {latestCalculationTime(worldview)}.
    <div class="join">
      <button class="btn btn-primary text-xl join-item" on:click={() => calculateScorecards()}>Retrieve My Grapevine</button>
      <button class="btn btn-info text-xl join-item" on:click={() => calculateScorecards(true)}>Recalculate</button>
    </div>
    {/if}

    {#if !worldview}
    Run the Calculation to see your network ... <br><br>
    <button class="btn btn-info text-xl" on:click={() => calculateScorecards()}>Calculate My Grapevine Network</button>
    {/if} 

  {/await}
  {/if}


  {#if scorecardspromise}
  {#await scorecardspromise}
  {#if worldview?.grapevines?.length && !recalculate}
  <p>
    Retrieving your calculated Grapevine 
    <span class="loading loading-dots loading-sm"></span>
  </p>
  {/if}
  {#if !worldview?.grapevines?.length}
  <p>
    Calculating Grapevine Scores for your network <br>
    (This may take a minute <span class="loading loading-dots loading-sm"></span>)
  </p>
  {/if}

  {:then}
  {#if scorecards}

  <div role="tablist" class="tabs tabs-boxed tabs-lg">
    <input type="radio" name="grapevine" role="tab" class="tab" aria-label="Summary" checked/>

    <div role="tabpanel" class="tab-content p-5 gap-2">
      <p class="text-xl">Grapevine found {numcards || 0} people in your network.</p>
      <p class="text-sm opacity-50">The calculation took {Math.round(calculationtime)} seconds and produced {cardsMB.toPrecision(4)}MB of data.</p>


      <div class="p-5 gap-3">
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Summary of <b class="{summarizefiltered ? 'text-primary' : ''}">{summarizefiltered ? 'Filtered' : 'All'} Results</b></span>
            <input type="checkbox" class="toggle" bind:checked={summarizefiltered} on:change={summarize} />
          </label>
        </div>
        {#each summary as score, index}
        <div>
          <progress class="progress progress-primary w-full" value={(score.count / numcards ) * 100} max={25}></progress>
          <p class="text-sm opacity-80">{score.count} people scored {score.min.toPrecision(1)} - {score.max.toPrecision(1)}</p>
        </div>
        {/each}
      </div>
    </div>

    <input type="radio" name="grapevine" role="tab" class="tab" aria-label="Filter" />
    <div role="tabpanel" class="tab-content p-5 gap-2">
        <ScorecardsFilter {scorecards} {filtered} {filtering}/>
    </div>

    <input type="radio" name="grapevine" role="tab" class="tab" aria-label="Results" />
    <div role="tabpanel" class="tab-content gap-2">
      {#if !$filtering }<ScorecardsAccordion scorecards={filtered} />{/if}
    </div>

    <input type="radio" name="grapevine" role="tab" class="tab" aria-label="Export" />
    <div role="tabpanel" class="tab-content p-5 gap-2">
        <ScorecardsExport scorecards={filtered} context={DEMO_CONTEXT}/>
    </div>

  </div>
  {/if}
  {/await}
  {/if}

  {/if}

</section>
