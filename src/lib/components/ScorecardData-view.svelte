<script lang="ts">
	import type { Scorecard } from "graperank-nodejs/src/types";

  export let scorecard : Scorecard
  const followedby = scorecard.input ? scorecard.input['nostr-follows'] : undefined
  const mutedby = scorecard.input ? scorecard.input['nostr-mutes'] : undefined
  const reportedby = scorecard.input ? scorecard.input['nostr-reports'] : undefined
  
</script>
{#if followedby}
<div class="stats stats-horizontal shadow">
  <div class="stat">
    <div class="stat-title">Followed By</div>
    <div class="stat-value">{Math.floor(followedby.count)}</div>
    <div class="stat-desc">in your network</div>
  </div>

  <div class="stat">
    <div class="stat-title">Avg Weight</div>
    <div class="stat-value">{Math.floor(followedby.weights)}</div>
    <div class="stat-desc">of followers</div>
  </div>

  <div class="stat">
    <div class="stat-title">Weighted Avg</div>
    <div class="stat-value">{Math.floor(followedby.weighted)}</div>
    <div class="stat-desc">of follow events</div>
  </div>
</div>
{/if}


{#if mutedby}
<div class="stats stats-horizontal shadow">
  <div class="stat">
    <div class="stat-title">Muted By</div>
    <div class="stat-value">{Math.floor(mutedby.count)}</div>
    <div class="stat-desc">in your network</div>
  </div>

  <div class="stat">
    <div class="stat-title">Avg Weight</div>
    <div class="stat-value">{Math.floor(mutedby.weights)}</div>
    <div class="stat-desc">of muters</div>
  </div>

  <div class="stat">
    <div class="stat-title">Weighted Avg</div>
    <div class="stat-value">{Math.floor(mutedby.weighted)}</div>
    <div class="stat-desc">of mute events</div>
  </div>
</div>
{/if}

{#if reportedby}
<div class="stats stats-horizontal shadow">
  <div class="stat">
    <div class="stat-title">Reported By</div>
    <div class="stat-value">{Math.floor(reportedby.count)}</div>
    <div class="stat-desc">in your network</div>
  </div>

  <div class="stat">
    <div class="stat-title">Avg Weight</div>
    <div class="stat-value">{Math.floor(reportedby.weights)}</div>
    <div class="stat-desc">of reporters</div>
  </div>

  <div class="stat">
    <div class="stat-title">Weighted Avg</div>
    <div class="stat-value">{Math.floor(reportedby.weighted)}</div>
    <div class="stat-desc">of report events</div>
  </div>
</div>
{/if}