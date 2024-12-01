<script lang="ts">
	import type { Scorecard } from "graperank-nodejs/src/types";
	import type { Writable } from "svelte/store";
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
  import RangeSlider from 'svelte-range-slider-pips'

  type filterinput = {
    showzeroscores : boolean,
    score : [number,number],
    confidence : [number,number],
    dos : [number,number],
    followedby : [number,number],
    mutedby : [number,number],
    reportedby : [number,number]
  }
  type filterdata = {
    scorecards: Scorecard[], 
    input : filterinput
  }

  export let scorecards : Scorecard[] 
  export let filtered : Writable<Scorecard[]>
  export let filtering : Writable<boolean>

  let input : filterinput = {
    showzeroscores : false,
    score : [0,0],
    confidence : [0,0],
    dos :  [0,0],
    followedby : [0,0],
    mutedby : [0,0],
    reportedby : [0,0]
  }

  let filterworker : Worker

  onMount(()=>{
    getLocalStorage()
    filter()
  })

  function getLocalStorage(){
    let localstorage : string | null = null
    if(browser) localstorage = window.localStorage.getItem('filterinput')
    if(localstorage) input = {...input, ...JSON.parse(localstorage)}
  }

  function setLocalStorage(){
    if(browser) window.localStorage.setItem('filterinput',JSON.stringify(input))
  }

  // use webworker to avoid browser crash 
  // when calling filter() multiple times from UI
  async function filter(){
    filtering.set(true)
    setLocalStorage()
    if(filterworker) filterworker.terminate()
    filterworker = new Worker("/workers/scorecards-filter.worker.js")
    return new Promise<void>((resolve)=>{
      filterworker.onmessage = (event)=>{
        if(event.data){
          filtered.set(event.data)
          filtering.set(false)
          filterworker.terminate()
          resolve()
        }
      }
      filterworker.postMessage({scorecards,input})
    })

  }


  let minValues = [ 20 ];
  // use this class to change the position of the floats at certain values
  $: minFlip = minValues[0] <= 20;
  $: maxFlip = minValues[0] >= 80;

  let values = [ 20, 80 ];
  // use this class to change the position of the floats at certain values
  $: rangeFlip = values[1] - values[0] <= 20;

</script>


<div class="mt-[-20px] mr-10 text-right">
  <small>Filtering 
  {#if $filtering}<span class="loading loading-dots loading-sm"></span>{/if}
  {!$filtering ? $filtered?.length : ''} of {scorecards.length}</small>
</div>

<br/>


<div class="daisy-ui" class:minFlip class:maxFlip class:rangeFlip>

<label>
  <div class="flex justify-between">
    <div>
      <span class="label-text">Influence Score &nbsp;</span>
      <!-- {#if input.score}
      &lt;= <input class="input w-24 input-sm" type="text" bind:value={input.score}/>
      {/if}  -->
    </div>
    <label class="text-sm text-right cursor-pointer">show zero scores &nbsp;
      <input type="checkbox" class="checkbox checkbox-xs" bind:checked={input.showzeroscores} on:change={filter}/>
    </label>
  </div>

<RangeSlider range pushy pips min={0} max={100} pipstep={1} float first="label" last="label" bind:values={input.score} on:stop={filter}/>
  <!-- <input type="range" min="0" max="1" step=".01" bind:value={input.score} on:change={() => filter()} class="range" /> -->
  <!-- <div class="flex w-full justify-between px-2 text-xs">
    <span>n/a</span>
    <span>.25</span>
    <span>.5</span>
    <span>.75</span>
    <span>1.0</span>
  </div> -->
</label>

<br/>

<label>
  <span class="label-text">Degrees of Separation &nbsp;</span>
  <!-- {#if input.dos}
  == <input class="input input-sm w-24" type="text" bind:value={input.dos}/>
  {/if} -->
  <RangeSlider range pushy pips min={0} max={6} pipstep={1} float first="label" last="label" bind:values={input.dos} on:stop={filter}/>
  <!-- <input type="range" min="0" max="6" bind:value={input.dos} class="range" step="1" on:change={() => filter()}/>
  <div class="flex w-full justify-between px-2 text-xs">
    <span>n/a</span>
    <span>1</span>
    <span>2</span>
    <span>3</span>
    <span>4</span>
    <span>5</span>
    <span>6</span>
  </div> -->
</label>

<br/>

<label>
  <span class="label-text">Followed By &nbsp; </span>
  <!-- {#if input.followedby}
  &lt;= <input class="input input-sm w-24" type="text" bind:value={input.followedby}/>    
  {/if} -->
  <RangeSlider range pushy pips min={0} max={5000} pipstep={100}  float first="label" last="label" bind:values={input.followedby} on:stop={filter}/>
  <!-- <input type="range" min="0" max="5000" bind:value={input.followedby} on:change={() => filter()} class="range" step="100"/>
  <div class="flex w-full justify-between px-2 text-xs">
    <span>n/a</span>
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
  </div> -->
</label>

<br/>

<label>
  <span class="label-text">Muted By &nbsp; </span>
  <!-- {#if input.mutedby}
  &lt;= <input class="input input-sm w-24" type="text" bind:value={input.mutedby}/>    
  {/if} -->
  <RangeSlider range pushy pips min={0} max={300} pipstep={10} float first="label" last="label" bind:values={input.mutedby} on:stop={filter}/>
  <!-- <input type="range" min="0" max="300" bind:value={input.mutedby} on:change={() => filter()} class="range" step="10"/>
  <div class="flex w-full justify-between px-2 text-xs">
    <span>n/a</span>
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
  </div> -->
</label>

<br/>

<label>
  <span class="label-text">Reported By &nbsp; </span>
  <!-- {#if input.reportedby}
  &lt;= <input class="input input-sm w-24" type="text" bind:value={input.reportedby}/>    
  {/if} -->
  <RangeSlider range pushy pips min={0} max={300} pipstep={10} float first="label" last="label" bind:values={input.reportedby} on:stop={filter}/>
  <!-- <input type="range" min="0" max="300" bind:value={input.reportedby} on:change={() => filter()} class="range" step="10"/>
  <div class="flex w-full justify-between px-2 text-xs">
    <span>n/a</span>
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
  </div> -->
</label>


</div>
