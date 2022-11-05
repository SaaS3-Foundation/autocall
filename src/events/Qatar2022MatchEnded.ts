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