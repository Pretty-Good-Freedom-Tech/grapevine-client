<script lang="ts">
	import type { Scorecard } from "graperank-nodejs/src/types";


  export let scorecard : Scorecard
 
</script>

{#if scorecard.input}
<div class="stats stats-horizontal">  
  <div class="stat">
    <div class="stat-title">Followed By</div>
    <div class="stat-value">{Math.floor(scorecard.input.count['nostr-follows']) || 0}</div>
    <div class="stat-desc">users in your network</div>
  </div>  
  <div class="stat">
    <div class="stat-title">DoS</div>
    <div class="stat-value">{Math.floor(scorecard.input.dos)}</div>
    <div class="stat-desc">deghrees of separation</div>
  </div>  
  <div class="stat">
    <div class="stat-title">Adjusted Weight</div>
    <div class="stat-value">{Math.floor(scorecard.input.weights)}</div>
    <div class="stat-desc">of follows for this user</div>
  </div>  
</div>

<div class="stats stats-horizontal">

  <div class="stat">
    <div class="stat-title">Muted By</div>
    <div class="stat-value">{Math.floor(scorecard.input.count['nostr-mutes']) || 0}</div>
  </div>  

  <div class="stat">
    <div class="stat-title">Reported By</div>
    <div class="stat-value">{Math.floor(scorecard.input.count['nostr-reports']) || 0}</div>
  </div> 

</div>
{/if}