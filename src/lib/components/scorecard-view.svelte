<script lang="ts">
	import { ndk } from "$lib/stores/ndk.store";
	import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
	import type { Scorecard } from "graperank-nodejs/src/types";
	import { onMount } from "svelte";
  import { DEFAULT_AVATAR } from "$lib/utils/const"

  export let scorecard : Scorecard
  let user : NDKUser = $ndk.getUser({pubkey:scorecard.subject as string})
  let profile : NDKUserProfile | undefined
  $: profile = undefined

  onMount(async ()=>{
    profile = user.profile || await user?.fetchProfile() || undefined
  })
</script>


{#if user}
  <div class="card flex flex-row items-center justify-between gap-5 p-2 w-full">
    <div class="avatar">
      <div class="rounded-full w-12 ring-2 ring-info ring-offset-4 ring-offset-purple-900">
        <img src={profile ? profile.image : DEFAULT_AVATAR} alt="avatar" />
      </div>
    </div> 

    <div class="grow text-left">
      <div class="font-bold">{ profile ? profile.name || profile.username : ""}</div>
      <div class="text-sm opacity-50">{ 
        profile?.nip05 && profile.nip05.length < 32 ? profile.nip05 
        : profile?.nip05 ? profile.nip05.substring(0,16)+'...' 
        : user.npub.substring(0,24)+'...'}</div>
    </div>

    <div class="rounded-lg bg-primary text-black p-2">
      <div class="text-2xl"><big>{scorecard.score}</big> 
      <!-- <sub>{scorecard.confidence}</sub> -->
      </div>
    </div>
  </div>
{/if}
{#if !user}
  <div class="card">
    <b>user not loaded</b>
  </div>
{/if}
