<script lang="ts">
	import type { Scorecard } from "graperank-nodejs/src/types";
	import { filterBigArray } from "graperank-nodejs/src/utils";
	import ScorecardView from "./scorecard-view.svelte";
	import ScorecardDataView from "./ScorecardData-view.svelte";
	import type { Writable } from "svelte/store";

  export let scorecards : Scorecard[] 
  export let filtered : Writable<Scorecard[]>

  let score : number | undefined = 0
  // let scoretens : number | undefined = score ? Math.round(score *10) *10 : 9
  // let scoreones : number | undefined = score ? Math.trunc(score, 10) *10 : 9
  let confidence : number = 0
  let dos : number  = 0
  let numfollowedby : number  = 0
  let followedbymore : boolean = false
  let nummutedby : number  = 0
  let mutedbymore : boolean = false
  let numreportedby : number  = 0
  let reportedbymore : boolean = false

  let filteresult : Scorecard[] = []
  let disabled : boolean
  $: disabled = false

  async function filter(){
    disabled = true
    filtered.set( await filterBigArray(scorecards, (scorecard)=>{
      return true &&
        (!score || ((scorecard.score || 0 ) > 0 && score >= (scorecard.score || 0))) &&
        (!dos || dos == scorecard.input?.dos) &&
        (!numfollowedby || numfollowedby >= (scorecard.input?.count['nostr-follows'] || 0)) &&
        (!nummutedby || nummutedby >= (scorecard.input?.count['nostr-mutes'] || 0)) &&
        (!numreportedby || numreportedby >= (scorecard.input?.count['nostr-reports'] || 0))
    }))
    disabled = false
  }

</script>

<div class="mt-[-20px] mr-10 text-right"><small>Filtering {$filtered.length} of {scorecards.length}</small></div>



<label>
  <span class="label-text">Influence Score &nbsp;</span>
  {#if score}
  &lt;= <input class="input w-24 input-sm" type="text" bind:value={score}/>
  {/if} 
  <input type="range" {disabled} min="0" max="1" step=".01" bind:value={score} on:change={() => filter()} class="range" />
  <div class="flex w-full justify-between px-2 text-xs">
    <span>0</span>
    <span>.25</span>
    <span>.5</span>
    <span>.75</span>
    <span>1.0</span>
  </div>
</label>

<br/>

<label>
  <span class="label-text">Degrees of Separation &nbsp;</span>
  {#if dos}
  == <input class="input input-sm w-24" type="text" bind:value={dos}/>
  {/if}
  <input type="range" {disabled} min="0" max="6" bind:value={dos} class="range" step="1" on:change={() => filter()}/>
  <div class="flex w-full justify-between px-2 text-xs">
    <span>0</span>
    <span>1</span>
    <span>2</span>
    <span>3</span>
    <span>4</span>
    <span>5</span>
    <span>6</span>
  </div>
</label>

<br/>

<label>
  <span class="label-text">Followed By &nbsp; </span>
  {#if numfollowedby}
  &lt;= <input class="input input-sm w-24" type="text" bind:value={numfollowedby}/>    
  {/if}
  <input type="range" {disabled} min="0" max="5000" bind:value={numfollowedby} on:change={() => filter()} class="range" step="100"/>
  <div class="flex w-full justify-between px-2 text-xs">
    <span>0</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>1k</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>2k</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>3k</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>4k</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>5k</span>
  </div>
</label>

<br/>

<label>
  <span class="label-text">Muted By &nbsp; </span>
  {#if nummutedby}
  &lt;= <input class="input input-sm w-24" type="text" bind:value={nummutedby}/>    
  {/if}
  <input type="range" {disabled} min="0" max="300" bind:value={nummutedby} on:change={() => filter()} class="range" step="10"/>
  <div class="flex w-full justify-between px-2 text-xs">
    <span>0</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>100</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>200</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>300</span>
  </div>
</label>

<br/>

<label>
  <span class="label-text">Reported By &nbsp; </span>
  {#if numreportedby}
  &lt;= <input class="input input-sm w-24" type="text" bind:value={numreportedby}/>    
  {/if}
  <input type="range" {disabled} min="0" max="300" bind:value={numreportedby} on:change={() => filter()} class="range" step="10"/>
  <div class="flex w-full justify-between px-2 text-xs">
    <span>0</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>100</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>200</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <span>300</span>
  </div>
</label>
