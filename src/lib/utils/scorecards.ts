import type { Scorecard, ScorecardsDataStorage } from "graperank-nodejs/src/types";

export async function fetchScorecards(pubkey : string, context? : string) : Promise<Scorecard[] | undefined>{
  console.log('grapevine getScorecards() params : ',pubkey,context)
  let scorecards : Scorecard[] = []
  let address = context ? pubkey+'/'+context : pubkey
  await fetch('/api/get/scorecards/'+address)
    .then(async r => {
      console.log('grapevine getScorecards() : fetched from api')
      let data = await r.json() as ScorecardsDataStorage
      if(data) data.forEach((entry)=>{
        scorecards.push({  subject : entry[0],  ...entry[1]  })
      })
    }).catch((e) => {
      console.log('GrapeVine : getScorecards() : fetch from api failed : ',e)
    })
    return scorecards
}


export function countScorecardsByScore(scorecards : Scorecard[], increment = .1, max = 1) : {min:number, max:number, count:number}[] {
  const count : {min:number, max:number, count:number}[] = []
  let min = max
  while(min > 0){
    min = min - increment
    console.log('GrapeVine : calling filterScorecardsByScore() : called with min/max : ',min, max, scorecards.length)
    let filtered = filterScorecardsByScore(scorecards, min, max)
    if(filtered.length)
    count.push({
      min, max,
      count : filtered.length
    })
    max = min
  }
  return count
}

export function filterScorecardsByScore(scorecards : Scorecard[], min : number, max :number, slice? : [number, number]) : Scorecard[]{
  const filtered = scorecards.filter((scorecard)=>{
    if(scorecard.score === undefined) return false
    let match = false
    if(scorecard.score >= min) match = true
    if(scorecard.score > max) match = false
    return match
  })
  return slice ? filtered.slice(...slice) : filtered
}
