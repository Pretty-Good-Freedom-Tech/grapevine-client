<script lang="ts">
	import { goto } from "$app/navigation";
	import GrapevineStats from "$lib/components/grapevine-stats.svelte";

  let observer : string = ""

</script>


<div class="p-5">
  
  <div class="chat chat-start">
    <div class="chat-image avatar">
      <div class="w-12 rounded-full ring-2 ring-info ring-offset-4 ring-offset-purple-900">
        <img
          alt="ManiMe"
          src="https://primal.b-cdn.net/media-cache?s=s&a=1&u=https%3A%2F%2Fprofilepics.nostur.com%2Fprofilepic_v1%2Fad749c9c22f8e74d5b2311b1069b771acd1249674f0ee57ed6de6f360ed654b8%2Fprofilepic.jpg%3F1709785889" />
      </div>
    </div>
    <div class="chat-bubble">My Grapevine feeds are free from bots and bad actors while still including new and interesting accounts to follow.</div>
    <div class="chat-footer">@ManiMe <i class="opacity-50">- Client Dev</i></div>
</div>

<div class="chat chat-end">
  <div class="chat-image avatar">
    <div class="w-12 rounded-full ring-2 ring-info ring-offset-4 ring-offset-purple-900">
      <img
        alt="Straycat"
        src="https://primal.b-cdn.net/media-cache?s=s&a=1&u=https%3A%2F%2Fpbs.twimg.com%2Fprofile_images%2F1402348796105875460%2F3pXzX7SL_400x400.jpg" />
    </div>
  </div>
  <div class="chat-bubble">Our opensource <a class="text-success underline" target="_blank" href="https://habla.news/a/naddr1qqxnzdes8q6rwv3hxs6rjvpeqgs98k45ww24g26dl8yatvefx3qrkaglp2yzu6dm3hv2vcxl822lqtgrqsqqqa28kn8wur">GrapeRank</a> algo (similar to Google PageRank) ingests ALL follows, mutes, and reports (soon zaps and other stuff also) from across Nostr to generate YOUR personalized Grapevine feeds. Web of Trust is only the begining.</div>
  <div class="chat-footer">@Straycat <i class="opacity-50">- Project Lead</i></div>
</div>

<div class="chat chat-start">
  <div class="chat-image avatar">
    <div class="w-12 rounded-full ring-2 ring-info ring-offset-4 ring-offset-purple-900">
      <img
        alt="Cloudfodder"
        src="https://primal.b-cdn.net/media-cache?s=s&a=1&u=https%3A%2F%2Frogue.earth%2F.well-known%2Fth3administrator1.jpg" />
    </div>
  </div>
  <div class="chat-bubble">Imagine <a class="text-success underline" target="_blank" href="https://nostr1.com">Nostr1</a> powered by My Grapevine, where anyone can instantly deploy their own WoT relay! Nostr is gonna love this!!</div>
  <div class="chat-footer">@cloudfodder <i class="opacity-50">- Relay Dev</i></div>
</div>
</div>



<hr class="border-primary opacity-50 my-5 mx-10">


<div class="card w-96">
  <div class="card-body">
    <h2 class="card-title">Try Our Demo</h2>
    <!-- <p><b>My Grapevine Reccomended List</b> <br> Discover interesting Nostriches from your follows follows.</p>
    <div class="card-actions justify-start">
      <a class="btn btn-info text-xl text-base-100" target="_blank" href="https://brainstorm.ninja/#/grapevine/actions/export">Go To Grapevine List Builder</a>
    </div> -->
    <div class="card-actions justify-start">

    <button class="btn join-item btn-info text-xl" on:click={()=>goto('/demo/'+observer)}>Grapevine Demo</button>
    </div>

  </div>
</div>

<hr class="border-primary opacity-50 my-5 mx-10">


<GrapevineStats/>
