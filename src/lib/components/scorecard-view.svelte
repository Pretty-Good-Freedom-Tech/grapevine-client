<script lang="ts">
	import { ndk } from "$lib/stores/ndk.store";
	import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
	import type { Scorecard } from "graperank-nodejs/src/types";
	import { onMount } from "svelte";
  import { DEFAULT_AVATAR } from "$lib/utils/const"
	import type { Writable } from "svelte/store";

  export let scorecard : Scorecard
  export let profiles : Writable<Map<String,NDKUserProfile>>

  let user : NDKUser | undefined 
  let profile : NDKUserProfile | undefined 
  $: profile = undefined

  try{
    user = $ndk.getUser({pubkey:scorecard.subject as string})
    if(!user.npub) throw('invalid npub')
    profile = user.profile || $profiles.get(user.pubkey)
  }catch(e){
    user = undefined
    profile = undefined
    console.log("GrapeVione : ERROR parsing scorecard pubkey as user : ", scorecard.subject)
  }

  onMount(async ()=>{
    profile = profile || await user?.fetchProfile() || undefined
    if(user && profile) $profiles.set(user.pubkey, profile)
  })
</script>


{#if user}
  <div class="card flex flex-row items-center gap-5 p-5">
    <div class="avatar {profile?.image ? '' : 'placeholder'}">
      <div class="rounded-full w-12 ring-2 ring-info ring-offset-4 ring-offset-purple-900">
        {#if profile?.image}
        <img src={ profile.image } alt="avatar" />
        {/if}
        {#if !profile?.image}
        <span class="text-3xl">🍇</span>
        {/if}
      </div>
    </div> 

    <div class="grow text-left">
      <a class="font-bold underline" href="https://njump.me/{user.npub}" target="_blank">{ 
        profile?.name && profile.name.length < 24 ? profile.name 
        : profile?.name ? profile.name.substring(0,18)+'...' 
        : typeof profile?.username == 'string' && profile.username.length < 24 ? profile.username 
        : typeof profile?.username == 'string' ? profile.username.substring(0,24)+'...' 
        : profile?.username || ""
        }</a>
      <div class="text-xs opacity-50">{ 
        profile?.nip05 && profile.nip05.length < 32 ? profile.nip05 
        : profile?.nip05 ? profile.nip05.substring(0,32)+'...' 
        : user.npub.substring(0,32)+'...'}</div>
    </div>

    <!-- <div class="indicator">
      <div class="indicator-item indicator-bottom badge badge-info">
        {scorecard.confidence}
      </div> -->
      <div
        class="radial-progress text-primary text-xl"
        style="--value:{Math.floor((scorecard?.score || 0)  * 100)};"
        role="progressbar">
        {scorecard.score?.toPrecision(2)}
      </div>
      <!-- <div class="text-2xl"><big>{scorecard.score?.toPrecision(2)}</big>  -->
      <!-- </div> -->
    <!-- </div> -->
  </div>
{/if}
{#if !user}
  <div class="card">
    <b>user not loaded</b>
  </div>
{/if}
