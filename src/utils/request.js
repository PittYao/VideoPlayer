import axios from 'axios'

// 后台地址
const instance = axios.create({
  baseURL: 'http://192.168.99.177:7778',
  // baseURL: 'http://127.0.0.1:7778',
  timeout: 10000
})

// 封装get请求
export const get = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    instance.get(url, { params }).then((response) => {
      resolve(response.data)
    }, err => {
      reject(err)
    })
  })
}

// 封装post请求
export const post = (url, data = {}) => {
  return new Promise((resolve, reject) => {
    instance.post(url, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      resolve(response.data)
    }, err => {
      reject(err)
    })
  })
}
