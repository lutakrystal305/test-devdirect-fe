const getData = (key) => {
  return JSON.parse(localStorage.getItem(key))
}

const setData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data))
}

const deleteData = (key) => {
  localStorage.removeItem(key)
}

const clearData = () => {
  localStorage.clear()
}

export default { getData, setData, deleteData, clearData }
