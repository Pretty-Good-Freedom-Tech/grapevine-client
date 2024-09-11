<script lang="ts">
	import { DEFAULT_RELAYS } from "$lib/utils/const";
	import { NDKEvent, NDKUser, type NDKFilter, type NDKUserProfile } from "@nostr-dev-kit/ndk";

  // Import the package
  import NDK from "@nostr-dev-kit/ndk";
	import { onMount } from "svelte";
  const topMax = 20;
  const defaultAvatarUrl = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
  let allListEvents : Set<NDKEvent>
  let allAuthorPubkeys : string[] = []
  let topAuthors : NDKUser[] = []
  let otherAuthors : NDKUser[] = []
  $: numAuthors = 0
  $: allAuthorsLoaded = false;


  onMount(async ()=>{
    // Create a filter
    const filter: NDKFilter = { kinds: [30000], '#d' : ['influenceScoresList'] };

    // Create a new NDK instance with explicit relays
    const ndk = new NDK({
        explicitRelayUrls: DEFAULT_RELAYS,
    });

    // Now connect to specified relays
    await ndk.connect();

    // Will return all found events
    allListEvents = await ndk.fetchEvents(filter);
    let setCounter = 0
    allListEvents.forEach(async ndkEvent => {
      const author = new NDKUser({pubkey:ndkEvent.pubkey})
      author.ndk = ndk
      let authorProfile : NDKUserProfile | null = null
      if(!allAuthorPubkeys.includes(author.pubkey)){
        authorProfile = await author.fetchProfile()
      }
      if(authorProfile){
        author.profile = authorProfile
        allAuthorPubkeys.push(author.pubkey)
        numAuthors = allAuthorPubkeys.length
        if(topAuthors.length <= topMax){
          topAuthors.push(author)
        }else{
          otherAuthors.push(author)
        }
      }
      setCounter ++
      if(setCounter >= allListEvents.size){
        allAuthorsLoaded = true;
      }
    });
  }
)

</script>


<div class="stats shadow py-5">
  <div class="stat place-items-center">
    <div class="stat-title">As Used By</div>
    <div class="stat-value">
      {#if !allAuthorsLoaded}
      <span class="loading loading-dots loading-lg"></span>
      {/if}
      {allAuthorsLoaded ? numAuthors : ""} Nostriches</div>
    <div class="stat-desc">in the last month</div>
  </div>
</div>

{#if allAuthorsLoaded}

<table class="table ml-5">
<tbody>
  <!-- row 1 -->        
  {#each topAuthors as author}
  <tr>
    <td>
      <div class="flex items-center gap-3">
        <div class="avatar">
          <div class="rounded-full w-12 ring-2 ring-info ring-offset-4 ring-offset-purple-900">
            <img src={author.profile?.image || defaultAvatarUrl} alt="avatar" />
          </div>
        </div> 

        <div>
          <div class="font-bold">{author.profile?.name || author.profile?.username}</div>
          <div class="text-sm opacity-50">{author.profile?.nip05 || author.npub}</div>
        </div>
      </div>
    </td>
  </tr>
  {/each}
  </tbody>
</table>
{/if}