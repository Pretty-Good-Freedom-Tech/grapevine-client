import type { NDKUser } from "@nostr-dev-kit/ndk";
import {type Writable, writable } from "svelte/store";


export const authuser: Writable<NDKUser | undefined> = writable();


