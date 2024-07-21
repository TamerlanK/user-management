class Person {
  constructor(name, address, email, phone_number, birthdate) {
    this.name = name
    this.address = address
    this.email = email
    this.phone_number = phone_number
    this.birthdate = birthdate
    this.age = this.calculateAge()
  }

  calculateAge() {
    const today = new Date()
    const birthDate = new Date(this.birthdate)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDifference = today.getMonth() - birthDate.getMonth()

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--
    }

    return age
  }
}

class User extends Person {
  constructor(name, address, email, phone_number, job, company, birthdate) {
    super(name, address, email, phone_number, birthdate)
    this.job = job
    this.company = company
    this.isRetired = this.age > 65
  }
}

const tableHeaders = [
  "name",
  "address",
  "email",
  "phone_number",
  "job",
  "company",
  "age",
  "isRetired",
]

let allUsers = []
let searchTerm = ""
let currentPage = 1
const USERS_PER_PAGE = 10

function fetchData() {
  const url = "http://localhost:3000/persons"

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      allUsers = convertDataToUsers(data)
      updateTable()
    })
    .catch((err) => alert("Failed to fetch users"))
}

function convertDataToUsers(data) {
  return data.map((user) => {
    const { name, address, email, phone_number, job, company, birthdate } = user
    return new User(name, address, email, phone_number, job, company, birthdate)
  })
}

function updateTable() {
  const filteredUsers = filterUsers(searchTerm)
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE)

  if (currentPage > totalPages) currentPage = totalPages
  if (currentPage < 1) currentPage = 1

  const start = (currentPage - 1) * USERS_PER_PAGE
  const end = start + USERS_PER_PAGE
  const paginatedUsers = filteredUsers.slice(start, end)

  populateTable(paginatedUsers)
  updatePaginationInfo(totalPages)
}

function populateTable(users) {
  const tableBody = document.getElementById("user-table-body")
  tableBody.innerHTML = ""

  if (users.length === 0) {
    const tr = document.createElement("tr")

    const td = document.createElement("td")
    td.colSpan = tableHeaders.length

    td.textContent = "No results found"
    td.classList.add("p-5", "border", "text-center", "text-gray-500")

    tr.appendChild(td)
    tableBody.appendChild(tr)

    return
  }

  users.forEach((user) => {
    const tr = document.createElement("tr")
    tr.classList.add("bg-white", "hover:bg-gray-50")

    tableHeaders.forEach((headerKey) => {
      const td = document.createElement("td")
      td.innerHTML = highlightSearchTerm(user[headerKey], searchTerm)
      td.classList.add(
        "p-3",
        "border",
        "whitespace-prewrap",
        "text-xs",
        "font-medium",
        "text-gray-900"
      )
      tr.appendChild(td)
    })

    tableBody.appendChild(tr)
  })
}

function filterUsers(searchTerm) {
  return allUsers.filter((user) => {
    return (
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    )
  })
}

function highlightSearchTerm(text, term) {
  if (!term) return text
  const regex = new RegExp(`(${term})`, "gi")
  return text.toString().replace(regex, `<span class="bg-yellow-200">$1</span>`)
}

function updatePaginationInfo(totalPages) {
  const paginationInfo = document.getElementById("pagination-info")
  paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`
}

document.addEventListener("DOMContentLoaded", () => {
  fetchData()

  const searchInput = document.getElementById("search-input")
  searchInput.addEventListener("input", (event) => {
    searchTerm = event.target.value.toLowerCase()
    currentPage = 1
    updateTable()
  })

  const previousButton = document.getElementById("previous-button")
  const nextButton = document.getElementById("next-button")

  previousButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--
      updateTable()
    }
  })

  nextButton.addEventListener("click", () => {
    const totalPages = Math.ceil(
      filterUsers(searchTerm).length / USERS_PER_PAGE
    )
    if (currentPage < totalPages) {
      currentPage++
      updateTable()
    }
  })
})
