<script lang="ts">
	import type { Scorecard } from "graperank-nodejs/src/types";
	import ScorecardView from "./scorecard-view.svelte";
	import ScorecardDataView from "./ScorecardData-view.svelte";

  export let scorecards : Scorecard[] 
  $: scorecards = []

</script>


<div class="join join-vertical w-full">
  {#each scorecards as scorecard }
  <div class="collapse collapse-arrow join-item border-base-300 border">
    <input type="radio" name="my-accordion-4" />
    <div class="collapse-title text-xl font-medium">
      <ScorecardView scorecard={scorecard}/>
    </div>
    <div class="collapse-content">
      <ScorecardDataView scorecard={scorecard}/>
    </div>
  </div>
  {/each}

</div>