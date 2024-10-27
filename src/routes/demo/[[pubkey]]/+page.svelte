
<script lang="ts">
	import ScorecardView from "$lib/components/scorecard-view.svelte";
	import { ndk } from "$lib/stores/ndk.store";
	import { DEMO_CONTEXT } from "$lib/utils/const";
	import { getScorecards, groupScorecardsByScore } from "$lib/utils/scorecards";
  import NDK, { NDKNip07Signer , NDKUser, type NDKUserProfile} from "@nostr-dev-kit/ndk";
  import type { Scorecard } from "graperank-nodejs/src/types";
	import { onMount } from "svelte";

	// export let data;

  const defaultAvatarUrl = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"

  let scorecardspromise : Promise<Scorecard[] | undefined>
  let profilepromise : Promise<NDKUserProfile | null>
  let scorecards : Scorecard[][] 
  $: scorecards = []
  // let topscorecards : Scorecard[] 
  // $: topscorecards= []
  // let bottomscorecards : Scorecard[] 
  // $: bottomscorecards = []
  // let grouped : Scorecard[][] | undefined
  // $: grouped = undefined
  // let groupincrement : number = 1
  // let groupselect : number
  // $: groupselect = 0
  let numcards : number
  $: numcards = 0
  let cardsMB : number
  $: cardsMB = 0
  let calculationtime : number
  $: calculationtime = 0
  let demouser : NDKUser | undefined
  $: demouser = $ndk.activeUser
  onMount(async ()=>{
    // console.log('grapevine page onMount() with pubkey ', data.pubkey)
    // if(pubkey) numcards = await setGrouped(pubkey)
  })

  // async function setGrouped(observer : string) : Promise<number | undefined>{
  //   console.log('grapevine calling getScorecards()')
  //   scorecards = await getScorecards(observer, DEMO_CONTEXT)
  //   if(!!scorecards) grouped = groupScorecardsByScore(scorecards, groupincrement)
  //   return scorecards?.length
  // }
 
 async function loginDemo(){
  $ndk.signer = new NDKNip07Signer()
  demouser = await $ndk.signer.user()
  profilepromise = demouser.fetchProfile()
  return 
 }

 async function calculateScorecards(){
  if(!demouser) return false
  calculationtime = Date.now()
  scorecardspromise = getScorecards(demouser.pubkey, DEMO_CONTEXT)
  scorecardspromise.then((cards)=>{
    if(cards){
      numcards = cards.length
      cardsMB = new TextEncoder().encode(JSON.stringify(cards)).length  / 1024 / 1024;
      scorecards = groupScorecardsByScore(cards,.1)
      calculationtime = (Date.now() - calculationtime) * .001
    }
    // topscorecards = scorecardsByScore(99, 100)
    // bottomscorecards = scorecardsByScore(0, .1)
  })
  return true
}

//  function scorecardsByScore(min = 0, max = 1){
//   return scorecards.filter((card)=>{
//     let match = true
//     if(!card.score) return false
//     if(card.score < min) match = false
//     if(card.score > max) match = false
//     return match
//   })
//  }
</script>

<section class="p-5">
  <h2 class="text-2xl">Demo : GrapeVine Web of Trust</h2>
  <hr class="p-3">
  {#if !$ndk.activeUser}
  Login with Nostr extention to launch the demo <br><br>
  <button class="btn btn-info text-xl" on:click={loginDemo}>Login</button>
  {/if}


  {#if demouser}
  {#await profilepromise then}
  <div class="flex items-center gap-3 p-5 w-full">
    <div class="avatar w-32">
      <div class="rounded-full w-24 ring-2 ring-info ring-offset-4 ring-offset-purple-900">
        <img src={demouser.profile?.image || defaultAvatarUrl} alt="avatar" />
      </div>
    </div> 

    <div class="grow h-24">
      <div class="text-xl font-bold">{demouser.profile?.name || demouser.profile?.username}</div>
      <div class="text-lg opacity-50">{demouser.profile?.nip05}</div>
      <div class="text-md opacity-30">{demouser.npub.slice(0,24)}...</div>
    </div>
  </div>
  {/await}


  {#if !scorecardspromise}
  Run the Calculation to see your network ... <br><br>
  <button class="btn btn-info text-xl" on:click={calculateScorecards}>Calculate My Grapevine Network</button>
  {/if}

  {#if scorecardspromise}
  {#await scorecardspromise}
  <p>
    Calculating GrapeRank Scores for your network <br>
    (This may take a minute <span class="loading loading-dots loading-sm"></span>)
  </p>

  {:then}
  {#if scorecards}
  <p class="text-xl">GrapeRank found {numcards || 0} people in your network.</p>
  <p class="text-sm opacity-50">The calculation took {Math.round(calculationtime)} seconds and produced {cardsMB.toPrecision(4)}MB of data.</p>

  <div class="p-5 gap-3">
    {#each scorecards as scoregroup, index}
    <div>
      <progress class="progress progress-primary w-full" value={(scoregroup.length / numcards ) * 100} max={25}></progress>
      <p class="text-sm opacity-80">{scoregroup.length} people scored {((scorecards.length - index -1) * .1).toPrecision(2)}</p>
    </div>
    {/each}
  </div>
  <br>


  <!-- <div role="tablist" class="tabs tabs-bordered">
    <input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Top Scores" checked/>
    <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
      <p>Here are the top {scorecards[0]?.length} trusted users in your network :</p>
      {#each scorecards[0] as scorecard }
        <ScorecardView scorecard={scorecard}/>
      {/each}
    </div>
    <input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Bottom Scores" />
    <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
      <p>Here are the bottom {scorecards?.length} possibly untrustworthy users in your network :</p>
      {#each scorecards[4] as scorecard }
        <ScorecardView scorecard={scorecard}/>
      {/each}
    </div>
  </div> -->
    {/if}
  {/await}
  {/if}

  {/if}

</section>
