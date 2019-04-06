import ACTIONS from './actionTypes';
import dispatchers from './dispatchers';
import { call, put } from 'redux-saga/effects';
import { createSagas } from '../../../../src';

const api= {
    fetchProfile = () => Promise.resolve({
        name: 'anish kumar',
        location: {
            city: 'Hyderabad',
            nation: 'India'
        }
    })
}

export default createSagas({
  [ACTIONS.FETCH_PROFILE]: function* fetchProfile() {
    const profile = yield call(api.fetchProfile);
    yield put(dispatchers.setFirstname(profile.name.split()[0]));
    yield put(dispatchers.setLastname(profile.name.split()[1]));
    yield put(dispatchers.setAddress(profile.location.city, profile.location.nation));
  },
});
