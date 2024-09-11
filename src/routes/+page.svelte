<script>
	import GrapevineStats from "$lib/components/grapevine-stats.svelte";

</script>
<div class="p-5 bg-neutral flex">
  <div class="text-6xl pr-3">🍇</div>
  <div>
    <h1 class="text-info text-4xl">My Grapevine</h1>
    <p class="text-primary text-xl">Smarter Webs of Trust for Nostr</p>
  </div>
</div>


<div class="card p-5">
  
  <div class="chat chat-start">
    <div class="chat-image avatar">
      <div class="w-10 rounded-full">
        <img
          alt="Tailwind CSS chat bubble component"
          src="https://primal.b-cdn.net/media-cache?s=s&a=1&u=https%3A%2F%2Fprofilepics.nostur.com%2Fprofilepic_v1%2Fad749c9c22f8e74d5b2311b1069b771acd1249674f0ee57ed6de6f360ed654b8%2Fprofilepic.jpg%3F1709785889" />
      </div>
    </div>
    <div class="chat-bubble">My Grapevine feeds are free from bots and bad actors while still including new and interesting accounts to follow.</div>
    <div class="chat-footer opacity-50">@ManiMe</div>
</div>

<div class="chat chat-end">
  <div class="chat-image avatar">
    <div class="w-10 rounded-full">
      <img
        alt="Tailwind CSS chat bubble component"
        src="https://primal.b-cdn.net/media-cache?s=s&a=1&u=https%3A%2F%2Fpbs.twimg.com%2Fprofile_images%2F1402348796105875460%2F3pXzX7SL_400x400.jpg" />
    </div>
  </div>
  <div class="chat-bubble">Our opensource <a class="text-info underline" target="_blank" href="https://habla.news/a/naddr1qqxnzdes8q6rwv3hxs6rjvpeqgs98k45ww24g26dl8yatvefx3qrkaglp2yzu6dm3hv2vcxl822lqtgrqsqqqa28kn8wur">GrapeRank</a> algo (similar to Google PageRank) ingests ALL follows, mutes, and reports (soon zaps and other stuff also) from across Nostr to generate YOUR personalized Grapevine feeds. Web of Trust is only the begining.</div>
  <div class="chat-footer opacity-50">@Straycat</div>
</div>

<div class="chat chat-start">
  <div class="chat-image avatar">
    <div class="w-10 rounded-full">
      <img
        alt="Tailwind CSS chat bubble component"
        src="https://primal.b-cdn.net/media-cache?s=s&a=1&u=https%3A%2F%2Frogue.earth%2F.well-known%2Fth3administrator1.jpg" />
    </div>
  </div>
  <div class="chat-bubble">Imagine <a class="text-info underline" target="_blank" href="https://nostr1.com">Nostr1</a> powered by My Grapevine, where anyone can instantly deploy their own WoT relay! Nostr is gonna love this!!</div>
  <div class="chat-footer opacity-50">@cloudfodder</div>
</div>
</div>



<hr class="opacity-50 my-5 mx-10">


<div class="card w-96">
  <div class="card-body">
    <h2 class="card-title">Try Our Demo</h2>
    <p><b>My Grapevine Reccomended List</b> <br> Discover interesting Nostriches from your follows follows.</p>
    <div class="card-actions justify-start">
      <a class="btn btn-neutral text-lg text-info" target="_blank" href="https://brainstorm.ninja/#/grapevine/actions/export">Go To Grapevine List Builder</a>
    </div>
  </div>
</div>

<hr class="opacity-50 my-5 mx-10">


<GrapevineStats/>
