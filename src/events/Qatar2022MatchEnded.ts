import { ConfigService, ConfigModule } from '@nestjs/config';
import { assert } from 'console';
import fetch from 'node-fetch';

type Participant = {
  participantID: string;
  participantName: string;
  score: string;
  logo: string;
};

type MatchResult = {
  gmtUpdated: number;
  calendar: {
    seasonID: number;
    leagueID: string;
    seasonName: string;
    fullName: string;
    stages: boolean;
    matchdays: [
      {
        matchdayID: string;
        matchdayName: string;
        matchdayPlayoff: string;
        matchdayType: string;
        matchdayStart: any;
        matchdayEnd: any;
        matches: [
          {
            matchID: string;
            matchStatus: {
              statusID: string;
            };
            matchDate: string;
            matchTime: string;
            matchVenue: {
              venueID: string;
            };
            homeParticipant: Participant;
            awayParticipant: Participant;
            group: {
              groupID: string;
              groupName: string;
            };
          },
        ];
      },
    ];
  };
};

const qatar2022 = async (apikey: string, season_id: string) => {
  let url =
    'https://api.statorium.com/api/v1/matches/?season_id=' +
    season_id +
    '&apikey=' +
    apikey;
  console.log(url);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  if (response.status !== 200) {
    return { ok: false, err: 'qatar2022 api error' };
  }
  const result = (await response.json()) as MatchResult;
  return { ok: true, data: result };
};

export const played = async (
  apikey: string,
  season_id: string,
  last_check: Date,
  playedlist: string[],
  only: string[],
): Promise<any> => {
  let data = await qatar2022(apikey, season_id);
  if (data.ok === false) {
    return data;
  }
  let mr = data.data as MatchResult;
  let matday_len = mr.calendar.matchdays.length;
  let result = null;
  for (let i = matday_len - 1; i >= 0; i--) {
    let matchday = mr.calendar.matchdays[i];
    if (matchday.matches === undefined) {
      continue;
    }
    let matches_len = matchday.matches.length;
    let found = false;
    for (let j = matches_len - 1; j >= 0; j--) {
      let match = matchday.matches[j];
      if (match.matchStatus.statusID !== '1') {
        continue;
      }
      if (only.length > 0 && only.indexOf(match.matchID) === -1) {
        continue;
      }
      if (playedlist.indexOf(match.matchID) == -1) {
        // found new
        found = true;
        result = {
          match_id: match.matchID,
          home: match.homeParticipant.participantName,
          away: match.awayParticipant.participantName,
        };
        break;
      }
    }
    if (found) {
      break;
    }
  }
  return result;
};

export const pending = async (
  apikey: string,
  season_id: string,
): Promise<any> => {
  let data = await qatar2022(apikey, season_id);
  if (data.ok === false) {
    return data;
  }
  let mr = data.data as MatchResult;
  let matday_len = mr.calendar.matchdays.length;
  let result = null;
  let ts = [];
  let names = [];
  let homes = [];
  let aways = [];
  for (let i = 0; i < matday_len; i++) {
    let matchday = mr.calendar.matchdays[i];
    if (matchday.matches === undefined) {
      continue;
    }
    let matches_len = matchday.matches.length;
    let found = false;
    for (let j = 0; j < matches_len; j++) {
      let match = matchday.matches[j];
      console.log(match);
      if (match.matchStatus.statusID === '1') {
        continue;
      }
      let d = match.matchDate + ' ' + match.matchTime + ' UTC';
      let ud = Date.parse(d);
      //if (ud > Date.now()) {
      // console.log('["' + ud + '", "' + (match.homeParticipant.participantName + '-' + match.awayParticipant.participantName) + '", "' + match.homeParticipant.participantName + '", "' + match.awayParticipant.participantName + '"]');
      ts.push(ud);
      names.push(
        match.homeParticipant.participantName +
          '-' +
          match.awayParticipant.participantName,
      );
      homes.push(match.homeParticipant.participantName);
      aways.push(match.awayParticipant.participantName);
      //}
    }
  }
  //console.log(ts.slice(0, 10));
  //console.log(names.slice(0, 10));
  //console.log(homes.slice(0, 10));
  //console.log(aways.slice(0, 10));
  assert(ts.length === names.length);
  assert(ts.length === homes.length);
  assert(ts.length === aways.length);
  assert(ts.length == 46);
  console.log(ts);
  console.log(names);
  console.log(homes);
  console.log(aways);
  return result;
};
