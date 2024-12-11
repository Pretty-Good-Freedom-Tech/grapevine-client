<script lang="ts">
	import type { Scorecard, ScorecardMeta } from "graperank-nodejs/src/types";


  export let scorecard : Scorecard

  let alerttrusted : boolean
  $: alerttrusted = false

</script>

{#if scorecard.meta && scorecard.meta['nostr-follows']}
<div class="stats stats-horizontal w-full">  
  <button class="stat place-items-center" on:click={()=> alerttrusted = !alerttrusted}>
    <div class="stat-title">Trusted Followers *</div>
    <div class="stat-value text-info">{scorecard.meta['nostr-follows'].weighted ? Math.floor(scorecard.meta['nostr-follows'].weighted) : 0}</div>
    <!-- <div class="stat-desc text-info font-bold">Grapevine Trusted Users *</div> -->
  </button>  
  <div class="stat place-items-center">
    <div class="stat-title">Degrees of Separation</div>
    <div class="stat-value">{scorecard.meta['nostr-follows'].dos ? Math.floor(scorecard.meta['nostr-follows'].dos) : 0}</div>
    <!-- <div class="stat-desc">degrees from you</div> -->
  </div>  

</div>

{#if alerttrusted}

  <div role="alert" class="alert alert-info relative">
    <div>
      <!-- <h3 class="font-bold">Grapevine Web of Trust</h3> -->
      <div class="text-sm"><b>Trusted Followers</b> are determined by weighting follows, mutes, and reports within your <b>Followed By</b> network.</div>
    </div>
    <button class="badge" style="position:absolute; top:5px;right:5px" on:click={()=> alerttrusted = false}>X</button>
  </div>

{/if}
{#if !alerttrusted}
<hr class="border-info">
{/if}

<div class="stats stats-horizontal w-full">
  <div class="stat place-items-center">
    <div class="stat-value">{scorecard.meta['nostr-follows'].numRatings ? Math.floor(scorecard.meta['nostr-follows'].numRatings) : 0}</div>
    <div class="stat-desc">Total Followed By</div>
  </div>  

  <div class="stat place-items-center">
    <div class="stat-value">{scorecard.meta['nostr-mutes'] && scorecard.meta['nostr-mutes'].numRatings ? Math.floor(scorecard.meta['nostr-mutes'].numRatings) : 0}</div>
    <div class="stat-desc">Total Muted By</div>
  </div>  

  <div class="stat place-items-center">
    <div class="stat-value">{scorecard.meta['nostr-reports'] && scorecard.meta['nostr-reports'].numRatings ? Math.floor(scorecard.meta['nostr-reports'].numRatings) : 0}</div>
    <div class="stat-desc">Total Reported By</div>
  </div> 

</div>

{/if}