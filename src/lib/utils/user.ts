import NDK, { NDKUser, type Hexpubkey, type NDKConstructorParams, type NDKSubscriptionOptions, type NDKUserProfile } from "@nostr-dev-kit/ndk";
import { NIP05, APP_DOMAIN, NPUB, PUBKEY, USERNAME } from "$lib/utils/const";
// import { ndk } from "$lib/stores/authuser.store";
import { nip19 } from "nostr-tools";
import { getContext } from "svelte";

// for passing user data between server and client
export type ApiUserData = {
  pubkey? : string,
  npub? : string,
  profile? : NDKUserProfile,
}

export type UseridTypes = 'username' | 'nip05' | 'npub' | 'pubkey';

export function parseNip05(slug: string|undefined = undefined) {
  if(!slug){
      return { username: '', domain: '' };
  }else if (slug.match(/@/)) {
      const [username, domain ] = slug.split('@');
      return {username, domain};
  } else {
      return { username: '_', domain: slug };
  }
}

export function getNip05(username:string, domain:string = APP_DOMAIN){
  return username+'@'+domain;
}

export function npubEncode(pubkey:string){
  return nip19.npubEncode(pubkey)
}
export function npubDecode(npub:string){
  return nip19.decode(npub).data as Hexpubkey
}

export function validatePubkey(pubkey : string){
  let pubkeyregex = /^[0-9a-fA-F]{64}$/
  try{
    if(!pubkeyregex.test(pubkey)) throw('')
    npubEncode(pubkey)
  }catch(e){
    return false
  }
  return true
}


export function userHasNip05Domain(user:NDKUser, hasdomain = APP_DOMAIN){
let {username, domain} = parseNip05(user.profile?.nip05)
return domain == hasdomain ? true : false; 
}

export function useridIsType(userid:string|undefined = undefined, type:UseridTypes|undefined = undefined):UseridTypes | undefined{
  let isType:UseridTypes|undefined = undefined;
  if(userid){
      // only alphanumeric and _ - are allowed
      const usernameregex = /^[a-z0-9_-]+$/i;
      // const usernameregex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/i;
      // https://www.regular-expressions.info/email.html
      const nip05Regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
      const npubRegex = /^npub1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58}$/;
      const pubkeyRegex = /^[0-9a-fA-F]{64}$/;
      if(((type == NIP05 || (type == undefined && !isType))) && nip05Regex.test(userid)) isType = NIP05;
      if(((type == NPUB || (type == undefined && !isType))) && npubRegex.test(userid)) isType = NPUB;
      if(((type == PUBKEY || (type == undefined && !isType))) && pubkeyRegex.test(userid)) isType = PUBKEY;
      if(((type == USERNAME || (type == undefined && !isType))) && usernameregex.test(userid)) isType = USERNAME;
  }
  console.log('checking userid istype : "'+ userid +'" = '+isType);
  return isType;
}

export function userHasId(user?:NDKUser,userid?:string,idtype?:UseridTypes) : UseridTypes | undefined{
  let ismatch : UseridTypes | undefined;
  if(!!user && !!user.profile){
      if((idtype == NIP05 || undefined) && userid == user.profile.nip05) ismatch = NIP05;
      if((idtype == NPUB || undefined) && userid == user.npub) ismatch = NPUB;
      if((idtype == PUBKEY || undefined) && userid == user.pubkey) ismatch = PUBKEY;
  }
  return ismatch;
}

// retrieves the preffered userid for given account :
// USERNAME => if valid NIP05 exists at this app domain
// NIP05 => if valid NIP05 addrress exists at all
// NPUB => otherwise use npub as userid
export async function getUserid(user:NDKUser) : Promise<string>{
  let userid = user.npub;
  if(!user.profile) await user.fetchProfile();
  // TODO validate nip05 against domains ? ...
  if(user.profile?.nip05){
      userid = user.profile.nip05;
      const {username,domain} = parseNip05(user.profile.nip05);
      // TODO is NIP05 verified?
      if(domain == APP_DOMAIN) userid = username;
  }
  return userid;
}



export async function newUserFromUserid(userid:string, useridtype?:UseridTypes, ndk?:NDK){
  useridtype = useridtype || useridIsType(userid);
  let user : NDKUser | undefined;
  ndk = ndk || getContext('ndk')
  if(!ndk) {
    console.log('NDK not loaded');
    return undefined;
  }
  if(!useridtype){
      console.log('useridtype not found in newUserFromUserid('+userid+','+useridtype+')')
      return undefined
  }
  switch (useridtype) {
      case NIP05:
          // load nip05
          console.log('new user instantiating from nip05 : '+userid);
          user =  await NDKUser.fromNip05(userid,ndk);
          break;
      case NPUB:
          // load npub
          console.log('new user instantiating from npub : '+userid);
          user = new NDKUser({'npub':userid});
          break;
      case PUBKEY:
          //load pubkey
          console.log('new user instantiating from pubkey : '+userid);
          user = new NDKUser({'pubkey':userid});
          break;
      case USERNAME:
          // load nip05 from app domain
          // TODO check existence of nip05 against NostrName cloud storage
          console.log('new user instantiating from username : '+userid);
          user =  await NDKUser.fromNip05(getNip05(userid),ndk);
          break        
      default:
          console.log('invalid userid for newUserFromUserid()');
          return undefined;
      }
      return user;
}

export async function loadUserProfile(user:NDKUser, ndk?:NDK, opts? : NDKSubscriptionOptions){
ndk = ndk || user.ndk || getContext('ndk')
if(!!ndk){
  user.ndk = ndk;
  console.log('calling fetchProfile : ' + user.pubkey)
  return await user.fetchProfile(opts).then((profile)=>{
    console.log('fetched profile : ' + profile?.nip07)
    return profile || undefined;
  }).catch((e)=>{
    console.log('failed to fetch profile : ' + e)
    return undefined;
  })
  // return user
}
return undefined;
}


