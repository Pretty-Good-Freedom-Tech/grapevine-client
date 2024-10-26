import { NDKUser, profileFromEvent, type NDKUserProfile } from "@nostr-dev-kit/ndk";
import { getNip05, npubDecode, npubEncode, useridIsType, type ApiUserData } from "./user";
import { NIP05, NPUB, PUBKEY, USERNAME } from "./const";

/**
 * Adapted from nostrmeet.me
 * https://docs.nostr.wine/
 */
export type ApiNostrWineSearchParams = {
  'query'? : string, // Search keyword(s) (* allowed)
  'kind'? : number, // Comma separated list of kind integers to include in search (e.g. kind=1,2,3)
  'since'? : number, // UNIX timestamp
  'until'? : number, // UNIX timestamp
  'limit'? : number, // Number of results per page (default: 20, max: 100)
  'pubkey'? : string, // Nostr pubkey in hex
  'sort'? : "time" | "relevance" | "first_seen" // Sort results (default: relevance)
  'page'? : number, // Pagination (default: 1)
  'order'? : "ascending" | "descending", // available only if sorting by time or first_seen (default: descending)
  'first_seen'? : boolean // Include first_seen timestamp on kind 0 and 3 results (default: false, automatically set to true if sort=first_seen)
}
export class ApiNostrWine {

  static async search(params: ApiNostrWineSearchParams = {}){
    let searchparams = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent((params as any)[key])}`)
    .join('&');
    let apiurl = new URL('https://api.nostr.wine/search?'+searchparams);
    return await fetch(apiurl).then((response)=>{
      let json = response.json()
      console.log('fetch('+ apiurl.toString()+') : ', json)
      return json;
    }).catch((e)=>{
      throw('ERROR from api.nostr.wine : '+e)
    })
  }

  // use to fetch profile data from any userid
  // since NDK does not opetate as expected from node server
  // returns instance of NDKUser with pubkey and profile
  static async fetchUserWithProfile(userid:string) : Promise<ApiUserData> {
    // let profile : NDKUserProfile | undefined;
    let userdata : ApiUserData = {};
    let useridType = useridIsType(userid);
    // build search params based on pubkey or nip05
    if(useridType == USERNAME) userid = getNip05(userid);
    if(useridType == NPUB) userid = npubDecode(userid);
    let searchParams :  ApiNostrWineSearchParams = 
      useridType == NPUB || useridType == PUBKEY ? {kind:0,pubkey:userid} : 
      {kind:0,query:userid};
    // execute api search
    let json = await this.search(searchParams);
    try{
      // return first match if useridType is npub or pubkey
      if(useridType == NPUB || useridType == PUBKEY){
        userdata = {};
        userdata.pubkey = userid;
        userdata.profile = profileFromEvent(json.data[0])
      }
      // otherwise return first matching nip05 
      else{
        for(let event of json.data){
          let testprofile = profileFromEvent(event)
          if(testprofile.nip05 == userid) {
            userdata = {};
            userdata.pubkey = event.pubkey;
            userdata.profile = testprofile;
            break;
          }
        }
      }
    }
    catch{}
    // if(!json?.data[0]) throw('nothing returned from api.nostr.wine')
    // console.log('api.nostr.wine : ',json)
    return userdata;
  }

}
