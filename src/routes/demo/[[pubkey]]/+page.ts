import { npubDecode } from "../../../lib/utils/user";


// export const ssr = false
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {

  if(params?.pubkey?.startsWith('npub1'))  
  return {pubkey:npubDecode(params.pubkey)}

}
