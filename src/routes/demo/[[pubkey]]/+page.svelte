
<script lang="ts">
	import ScorecardView from "$lib/components/scorecard-view.svelte";
	import { ndk } from "$lib/stores/ndk.store";
	import { DEMO_CONTEXT } from "$lib/utils/const";
	import { getScorecards, groupScorecardsByScore } from "$lib/utils/scorecards";
  import NDK, { NDKNip07Signer , NDKUser, type NDKUserProfile} from "@nostr-dev-kit/ndk";
  import type { Scorecard } from "graperank-nodejs/src/types";
	import { onMount } from "svelte";

	export let data;

  const defaultAvatarUrl = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"

  let scorecardspromise : Promise<Scorecard[] | undefined>
  let profilepromise : Promise<NDKUserProfile | null>
  let scorecards : Scorecard[] = []
  let topscorecards : Scorecard[] 
  $: topscorecards= []
  let bottomscorecards : Scorecard[] 
  $: bottomscorecards = []
  // let grouped : Scorecard[][] | undefined
  // $: grouped = undefined
  // let groupincrement : number = 1
  // let groupselect : number
  // $: groupselect = 0
  let numcards : number
  $: numcards = 0
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
  scorecardspromise = getScorecards(demouser.pubkey, DEMO_CONTEXT)
  await scorecardspromise.then((scorecards)=>{
    scorecards = scorecards
    topscorecards = scorecardsByScore(99, 100)
    bottomscorecards = scorecardsByScore(0, .1)
  })
  return true
}

 function scorecardsByScore(min = 0, max = 1){
  return scorecards.filter((card)=>{
    let match = true
    if(!card.score) return false
    if(card.score < min) match = false
    if(card.score > max) match = false
    return match
  })
 }
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

  <p class="text-xl">GrapeRank found {scorecards?.length || 0} people in your network.</p>
  <br>
  {#if topscorecards}
    <p>Here are the top {topscorecards.length} trusted users in your network :</p>
    {#each topscorecards as scorecard }
      <ScorecardView scorecard={scorecard}/>
    {/each}
  {/if}

  {/await}
  {/if}

  {/if}

</section>
