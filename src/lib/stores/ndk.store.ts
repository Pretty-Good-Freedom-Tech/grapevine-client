import { DEFAULT_RELAYS } from "$lib/utils/const";
import type { NDKConstructorParams } from "@nostr-dev-kit/ndk";
import NDK from "@nostr-dev-kit/ndk";
import { setContext } from "svelte";
import {type Writable, writable } from "svelte/store";



// get curent state of NDK instance ... including ndk.signer
export const ndk: Writable<NDK> = writable();

export async function loadNDK(params:NDKConstructorParams | boolean = false){
  let connected : Boolean = await new Promise((resolve)=>{
    ndk.update((ndk)=>{
      if(ndk && !params) return ndk
      if(typeof params == 'boolean') params = {}
      let newndk:NDK | undefined;
      let config:NDKConstructorParams = {...{
          explicitRelayUrls: DEFAULT_RELAYS,
          debug: false
      }, ...params}
      newndk = new NDK(config);
      // try to connect
      newndk.connect().then(() =>  {
        console.log('ndk connected')
        resolve(true)
      }).catch((e)=> { 
        console.log('ndk FAILED to connect : ' + e);
        resolve(false)
      });
      return newndk
    })
  })

  // ...and add it to the context for child components to access
	// setContext('ndk', ndk);

  return ndk
}

