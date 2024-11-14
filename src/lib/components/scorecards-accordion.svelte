<script lang="ts">
	import type { Scorecard } from "graperank-nodejs/src/types";
	import ScorecardView from "./scorecard-view.svelte";
	import ScorecardDataView from "./ScorecardData-view.svelte";
	import VirtualList from "./VirtualList.svelte";
	import { writable, type Writable } from "svelte/store";
	import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
	import { onMount } from "svelte";

  export let scorecards : Writable<Scorecard[]>

  let profiles : Writable<Map<String,NDKUserProfile>> = writable(new Map())
  let start : number = 0
  let end : number = 1
  let rerender = false

  const sortoptions : Map<string,(a: Scorecard, b: Scorecard) => number> = new Map([
    ['Highest Influence Score',
      (a: Scorecard, b: Scorecard)=> (b.score || 0)  - (a.score || 0)
    ],
    ['Lowest Influence Score',
      (a: Scorecard, b: Scorecard)=> (a.score || 0)  - (b.score || 0)
    ],
    ['Most Followed By',
      (a: Scorecard, b: Scorecard) => 
        (b.input?.count ? b.input.count['nostr-follows'] || 0 : 0) -
        (a.input?.count ? a.input.count['nostr-follows'] || 0 : 0)
    ],
    ['Least Followed By',
      (a: Scorecard, b: Scorecard) => 
        (a.input?.count ? a.input.count['nostr-follows'] || 0 : 0) -
        (b.input?.count ? b.input.count['nostr-follows'] || 0 : 0)
    ],
    ['Closest Degree of Separation',
      (a: Scorecard, b: Scorecard)=> (a.input?.dos  || 0)  - (b.input?.dos || 0)
    ],
    ['Farthest Degree of Separation',
      (a: Scorecard, b: Scorecard)=> (b.input?.dos || 0)  - (a.input?.dos  || 0)
    ],
    ['Highest Weight of Follows',
      (a: Scorecard, b: Scorecard)=> (b.input?.weights || 0)  - (a.input?.weights  || 0)
    ],
    ['Lowest Weight of Follows',
      (a: Scorecard, b: Scorecard)=> (a.input?.weights  || 0)  - (b.input?.weights || 0)
    ],
  ])
  let sortby : string = sortoptions.keys().next().value as string
  function sort(){
    if($scorecards) $scorecards.sort(sortoptions.get(sortby))
    rerender = !rerender
  }
  onMount(sort)
</script>

{#if !$scorecards.length}<span class="m-10 loading loading-bars loading-lg"></span>
{/if}

<div class=" mr-10 text-right"><small>showing {start}-{end} of {$scorecards.length} filtered</small></div>
<label class="label cursor-pointer">
  <span class="label-text">Sort by : </span>
  <select class="select w-full max-w-xs" bind:value={sortby}  on:change={sort}>
		{#each sortoptions as value}
			<option value={value[0]}> {value[0]} </option>
		{/each}
	</select>
</label>

{#key rerender}
  <VirtualList items={$scorecards} bind:start bind:end let:item height='480px'>
    <div class="collapse collapse-arrow">
        <input type="radio" name="scorecards-list" class="w-32 ml-[300px]" style="position:relative right:0px"/>
        <div class="collapse-title text-xl font-medium p-0">
          <ScorecardView scorecard={item} {profiles}/>
        </div>
        <div class="collapse-content">
          <ScorecardDataView scorecard={item}/>
        </div>
      </div>    
  </VirtualList>
{/key}
