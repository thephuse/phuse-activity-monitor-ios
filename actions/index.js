import moment from 'moment'
import dateFormat from '../helpers/dateFormat'
import { serverUrl } from '../config'

export const SORT_BY = 'SORT_BY'
export const SET_DATES = 'SET_DATES'
export const SET_PERIOD = 'SET_PERIOD'
export const SET_COOKIE = 'SET_COOKIE'
export const REQUEST_TIMES = 'REQUEST_TIMES'
export const RECEIVE_TIMES = 'RECEIVE_TIMES'

export function setCookie(cookie) {
  return {
    type : SET_COOKIE,
    cookie
  }
}

export function requestTimes({ startDate, endDate }) {
  return {
    type : REQUEST_TIMES,
    startDate,
    endDate
  }
}

export function receiveTimes(times) {
  return {
    type : RECEIVE_TIMES,
    times,
    receivedAt : Date.now()
  }
}

export function generateDates(state) {
  const { startDate, endDate } = state.timesheets
  return {
    startDate,
    endDate
  }
}

export function getCookie(state) {
  const { cookie } = state.timesheets
  return cookie
}

export function sortBy(sort) {
  return {
    type : SORT_BY,
    value : sort
  }
}

export function setPeriod(period) {
  return {
    type : SET_PERIOD,
    period
  }
}

export function setDates(selectedDate = new Date(), startOrEnd = 'start') {
  return (dispatch, getState) => {
    let { period, startDate, endDate } = getState().timesheets

    switch (period) {
      case 'YEAR' :
        startDate = moment(selectedDate).startOf('year').format(dateFormat)
        endDate = moment(selectedDate).startOf('year').add(1, 'year').subtract(1, 'day').format(dateFormat)
        break
      case 'MONTH' :
        startDate = moment(selectedDate).startOf('month').format(dateFormat)
        endDate = moment(selectedDate).startOf('month').add(1, 'month').subtract(1, 'day').format(dateFormat)
        break
      case 'WEEK' :
        startDate = moment(selectedDate).startOf('isoweek').format(dateFormat)
        endDate = moment(selectedDate).startOf('isoweek').add(6, 'days').format(dateFormat)
        break
      case 'DAY' :
        startDate = moment(selectedDate).format(dateFormat)
        endDate = moment(selectedDate).format(dateFormat)
        break
      case 'CUSTOM' :
      default :
        switch (startOrEnd) {
          case 'end' :
            endDate = moment(selectedDate).format(dateFormat)
            break
          case 'start' :
          default :
            startDate = moment(selectedDate).format(dateFormat)
            break
        }
        break
    }

    dispatch({
      type : SET_DATES,
      startDate,
      endDate
    })
  }
}

export function fetchTimes() {
  return (dispatch, getState) => {
    const state = getState()
    const dates = generateDates(state)
    const cookie = getCookie(state)
    dispatch(requestTimes(dates))
    return fetch(`${serverUrl}/times/2016-01-01/${dates.endDate}`, { headers: { cookie: cookie } })
      .then(response => response.json())
      .then(json => json.map(item => item.user).filter(item => (item.total > 0)))
      .then(times => dispatch(receiveTimes(times)))
  }
}