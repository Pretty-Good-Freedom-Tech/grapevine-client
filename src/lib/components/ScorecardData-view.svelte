<script lang="ts">
	import type { Scorecard } from "graperank-nodejs/src/types";


  export let scorecard : Scorecard
 
</script>

{#if scorecard.input}
<div class="stats stats-horizontal w-full">  
  <div class="stat place-items-center">
    <div class="stat-title">Followed By</div>
    <div class="stat-value">{scorecard.input.weights ? Math.floor(scorecard.input.weights) : 0}</div>
    <div class="stat-desc">users in your network</div>
  </div>  
  <div class="stat place-items-center">
    <div class="stat-title">Separated By</div>
    <div class="stat-value">{scorecard.input.dos ? Math.floor(scorecard.input.dos) : 0}</div>
    <div class="stat-desc">degrees from you</div>
  </div>  

</div>

<hr>
<div class="stats stats-horizontal w-full">
  <div class="stat place-items-center">
    <div class="stat-value">{scorecard.input.count['nostr-follows'] ? Math.floor(scorecard.input.count['nostr-follows']) : 0}</div>
    <div class="stat-desc">Total Followed By</div>
  </div>  

  <div class="stat place-items-center">
    <div class="stat-value">{scorecard.input.count['nostr-mutes'] ? Math.floor(scorecard.input.count['nostr-mutes']) : 0}</div>
    <div class="stat-desc">Total Muted By</div>
  </div>  

  <div class="stat place-items-center">
    <div class="stat-value">{scorecard.input.count['nostr-reports'] ? Math.floor(scorecard.input.count['nostr-reports']) : 0}</div>
    <div class="stat-desc">Total Reported By</div>
  </div> 

</div>
{/if}