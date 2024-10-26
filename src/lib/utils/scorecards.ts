import { browser } from "$app/environment";
import type { Scorecard } from "graperank-nodejs/src/types";

export async function getScorecards(pubkey : string, context? : string) : Promise<Scorecard[] | undefined>{
  console.log('grapevine getScorecards() params : ',pubkey,context)
  let scorecards : Scorecard[] | undefined = undefined
  let address = context ? pubkey+'/'+context : pubkey
  let localstorage : string | null = null
  if(browser) localstorage = window.localStorage.getItem(address);
  // if(localstorage) {
  //   console.log('grapevine getScorecards() : retrieved from localstorage')
  //   return JSON.parse(localstorage) as Scorecard[]
  // }
  scorecards = await fetch('/api/get/scorecards/'+address)
    .then(r => {
      console.log('grapevine getScorecards() : fetched from api')
      return r.json()
    }).catch((e) => {
      console.log('grapevine getScorecards() : fetch from api failed : ',e)
    })
  // if(browser && !!scorecards) {
  //   localstorage = JSON.stringify(scorecards)
  //   console.log('grapevine getScorecards() : sending ',localstorage.length,' bytes to localstorage...')
  //   try{
  //     window.localStorage.setItem(address, localstorage)
  //   }catch(e){
  //     console.log('grapevine getScorecards() : localstorage failed :', e)
  //   }
  // };
  return scorecards
}

export function groupScorecardsByScore(scorecards : Scorecard[], increment = 1){
  const grouped : Scorecard[][] = []
  let i = 0
  let n = 0
  while(n < scorecards.length){
    grouped[i] = filterScorecardsByScore(scorecards, i, i + increment)
    n = n + grouped[i].length
    i++
  }
  return grouped
}

export function filterScorecardsByScore(scorecards : Scorecard[], min :number, max :number) : Scorecard[]{
  const filtered : Scorecard[] = []
  for(let c in scorecards){
    if(!!scorecards[c] && scorecards[c].score)
    if(scorecards[c].score >= min && scorecards[c].score < max ) 
    filtered.push(scorecards[c])
  }
  return filtered
}
