<script>
	import GrapevineStats from "$lib/components/grapevine-stats.svelte";

</script>
<div class="p-5 bg-neutral ">
<h1 class="text-info text-4xl">My Grapevine</h1>
<p class="text-primary text-xl">Webs of Trust for Nostr</p>
</div>


<div class="card w-96">
  <div class="card-body">
    <h2 class="card-title">My Grapevine Reccomended List</h2>
    <p>Discover interesting Nostriches from your follows follows.</p>
    <div class="card-actions justify-start">
      <a class="btn btn-neutral text-lg text-info" target="_blank" href="https://brainstorm.ninja/#/grapevine/actions/export">Go To Grapevine List Builder</a>
    </div>
  </div>
</div>

<GrapevineStats/>
