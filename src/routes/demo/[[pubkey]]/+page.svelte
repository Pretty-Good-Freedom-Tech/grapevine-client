
<script lang="ts">
  // import { DEMO_CONTEXT } from "graperank-nodejs/src";
  import ScorecardView from "$lib/components/scorecard-view.svelte";
	import ScorecardsAccordion from "$lib/components/scorecards-accordion.svelte";
	import ScorecardsExport from "$lib/components/scorecards-export.svelte";
	import ScorecardsFilter from "$lib/components/scorecards-filter.svelte";
	import { loadNDK, ndk } from "$lib/stores/ndk.store";
	import { DEFAULT_RELAYS } from "$lib/utils/const";
	import { countScorecardsByScore, fetchScorecards, filterScorecardsByScore } from "$lib/utils/scorecards";
  import NDK, { getRelayListForUsers, NDKNip07Signer , NDKUser, type NDKUserProfile} from "@nostr-dev-kit/ndk";
  import type { Scorecard } from "graperank-nodejs/src/types";
	import { onMount } from "svelte";
	import { writable } from "svelte/store";

	// export let data;
  const DEMO_CONTEXT = 'grapevine-web-of-trust-demo'

  const defaultAvatarUrl = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"

  let scorecardspromise : Promise<Scorecard[] | undefined>
  let profilepromise : Promise<NDKUserProfile | null>
  let scorecards : Scorecard[]
  let filtered = writable<Scorecard[]>()
  let filtering = writable<boolean>()
  // filtered.subscribe(()=>{ rerender = !rerender })

  let numcards : number
  $: numcards = 0
  let cardsMB : number
  $: cardsMB = 0
  let calculationtime : number
  $: calculationtime = 0
  let demouser : NDKUser | undefined
  $: demouser = undefined
  onMount(async ()=>{
  })
 
 async function loginDemo(){
  let connected = await loadNDK({signer : new NDKNip07Signer()})
  if(connected) {
    demouser = await $ndk.signer?.user()
    if(demouser) profilepromise = demouser.fetchProfile()
  }
  return 
 }

 async function calculateScorecards(recalculate? : boolean){
  if(!demouser) return false
  calculationtime = Date.now()
  scorecardspromise = fetchScorecards(demouser.pubkey, DEMO_CONTEXT, recalculate)
  scorecardspromise.then((scorecardstorage)=>{
    if(scorecardstorage){
      scorecards = scorecardstorage
      filtered.set(scorecards)
      numcards = scorecards.length
      cardsMB = new TextEncoder().encode(JSON.stringify(scorecards)).length  / 1024 / 1024;
      calculationtime = (Date.now() - calculationtime) * .001
    }
  })
  return true
}

</script>

<section class="p-5">
  <div class="text-center"><span class="badge badge-primary badge-outline badge-lg p-4 mb-3">DEMO</span></div>

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
    <!-- {#if scorecards?.length}
    <button class="btn btn-sm btn-info text-right" on:click={() => calculateScorecards(true)}>Recalculate</button>
    {/if} -->
  </div>
  <hr class="p-3">

  
  {#if !scorecardspromise}
  Run the Calculation to see your network ... <br><br>
  <button class="btn btn-info text-xl" on:click={() => calculateScorecards()}>Calculate My Grapevine Network</button>
  {/if}

  {#if scorecardspromise}
  {#await scorecardspromise}
  <p>
    Calculating GrapeRank Scores for your network <br>
    (This may take a minute <span class="loading loading-dots loading-sm"></span>)
  </p>

  {:then}
  {#if scorecards}

  <div role="tablist" class="tabs tabs-boxed tabs-lg">
    <input type="radio" name="grapevine" role="tab" class="tab" aria-label="Summary" checked/>

    <div role="tabpanel" class="tab-content p-5 gap-2">
      <p class="text-xl">GrapeRank found {numcards || 0} people in your network.</p>
      <p class="text-sm opacity-50">The calculation took {Math.round(calculationtime)} seconds and produced {cardsMB.toPrecision(4)}MB of data.</p>
    
      <div class="p-5 gap-3">
        {#each countScorecardsByScore(scorecards) as score, index}
        <div>
          <progress class="progress progress-primary w-full" value={(score.count / numcards ) * 100} max={25}></progress>
          <p class="text-sm opacity-80">{score.count} people scored {score.min.toPrecision(1)} - {score.max.toPrecision(1)}</p>
        </div>
        {/each}
      </div>
    </div>

    <input type="radio" name="grapevine" role="tab" class="tab" aria-label="Results" />
    <div role="tabpanel" class="tab-content gap-2">
      {#if !$filtering }<ScorecardsAccordion scorecards={filtered} />{/if}
    </div>

    <input type="radio" name="grapevine" role="tab" class="tab" aria-label="Filter" />
    <div role="tabpanel" class="tab-content p-5 gap-2">
        <ScorecardsFilter {scorecards} {filtered} {filtering}/>
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
