<script lang="ts">
	import type { Scorecard } from "graperank-nodejs/src/types";
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

  scorecards.forEach((scorecard)=>{

  })

  function filter(){
    filtered.set( scorecards.filter((scorecard)=>{
        return true &&
        (!score || (score * .01) == scorecard.score?.toPrecision(2) as unknown as number) &&
        (!dos || dos == scorecard.input?.dos) &&
        (!numfollowedby || (scorecard.input?.count['nostr-follows'] || 0) > numfollowedby) &&
        (!nummutedby || (scorecard.input?.count['nostr-mutes'] || 0) < nummutedby) &&
        (!numreportedby || (scorecard.input?.count['nostr-reports'] || 0) < numreportedby)
        // || ( followedbymore ? 
        //   (scorecard.input?.count['nostr-follows'] || 0) > numfollowedby : 
        //   (scorecard.input?.count['nostr-follows'] || 0) < numfollowedby )) &&
        // (!nummutedby || ( mutedbymore ? 
        //   (scorecard.input?.count['nostr-mutes'] || 0) > nummutedby : 
        //   (scorecard.input?.count['nostr-mutes'] || 0) < nummutedby )) &&
        // (!numreportedby || ( reportedbymore ? 
        //   (scorecard.input?.count['nostr-reports'] || 0) > numreportedby : 
        //   (scorecard.input?.count['nostr-reports'] || 0) < numreportedby ))
      })
    ) 
  }

</script>

<div class="mt-[-20px] mr-10 text-right"><small>Filtering {$filtered.length} of {scorecards.length} scorecards</small></div>



<label>
  <span class="label-text">Influence Score &nbsp;= </span>
  <input class="input" type="text" bind:value={score}/>
  <input type="range" min="0" max="100" bind:value={score} on:change={() => filter()} class="range" />
  <div class="flex w-full justify-between px-2 text-xs">
    <span>0</span>
    <span>...</span>
    <span>50</span>
    <span>...</span>
    <span>100</span>
  </div>
</label>

<br/>

<label>
  <span class="label-text">Degrees of Separation &nbsp;= </span>
  <input class="input w-24" type="text" bind:value={dos}/>
  <input type="range" min="0" max="6" bind:value={dos} class="range" step="1" on:change={() => filter()}/>
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
  <span class="label-text">Followed By &nbsp;&gt;</span>
  <!-- <label class="swap p-2">
    <input type="checkbox" bind:value={followedbymore}  on:change={() => filter()} />
    <div class="swap-on text-xl">&lt;</div>
    <div class="swap-off text-xl">&gt;</div>
  </label> -->
  <input class="input w-24" type="text" bind:value={numfollowedby}/>
  <input type="range" min="0" max="5000" bind:value={numfollowedby} on:change={() => filter()} class="range" step="100"/>
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
  <span class="label-text">Muted By &nbsp;&lt;</span>
  <!-- <label class="swap p-2">
    <input type="checkbox" bind:value={mutedbymore}  on:change={() => filter()} />
    <div class="swap-on text-xl">&lt;</div>
    <div class="swap-off text-xl">&gt;</div>
  </label> -->
  <input class="input w-24" type="text" bind:value={nummutedby}/>
  <input type="range" min="0" max="300" bind:value={nummutedby} on:change={() => filter()} class="range" step="10"/>
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
  <span class="label-text">Reported By &nbsp;&lt;</span>
  <!-- <label class="swap p-2">
    <input type="checkbox" bind:value={reportedbymore}  on:change={() => filter()} />
    <div class="swap-on text-xl">&lt;</div>
    <div class="swap-off text-xl">&gt;</div>
  </label> -->
  <input class="input w-24" type="text" bind:value={numreportedby}/>
  <input type="range" min="0" max="300" bind:value={numreportedby} on:change={() => filter()} class="range" step="10"/>
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
