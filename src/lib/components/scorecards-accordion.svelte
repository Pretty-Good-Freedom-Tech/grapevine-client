<script lang="ts">
	import type { Scorecard } from "graperank-nodejs/src/types";
	import ScorecardView from "./scorecard-view.svelte";
	import ScorecardDataView from "./ScorecardData-view.svelte";
	import VirtualList from "./VirtualList.svelte";

  export let scorecards : Scorecard[] 

  let start : number = 0
  let end : number = 1

</script>
<div class="mt-[-30px] mr-10 text-right"><small>showing {start}-{end} of {scorecards.length}</small></div>
  <VirtualList items={scorecards} bind:start bind:end let:item height='480px'>
    <div class="collapse collapse-arrow join-item border-base-300 border">
        <input type="radio" name="my-accordion-4" />
        <div class="collapse-title text-xl font-medium">
          <ScorecardView scorecard={item}/>
        </div>
        <div class="collapse-content">
          <ScorecardDataView scorecard={item}/>
        </div>
      </div>    
  </VirtualList>
