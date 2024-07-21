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
  constructor(id, name, address, email, phone_number, job, company, birthdate) {
    super(name, address, email, phone_number, birthdate)
    this.id = id
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
    const { id, name, address, email, phone_number, job, company, birthdate } =
      user
    return new User(
      id,
      name,
      address,
      email,
      phone_number,
      job,
      company,
      birthdate
    )
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
    td.colSpan = tableHeaders.length + 1
    td.textContent = `No results found for "${searchTerm}"`
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

    const deleteTd = document.createElement("td")
    deleteTd.classList.add("p-3", "text-center")

    const deleteButton = document.createElement("button")
    deleteButton.innerHTML = `<i class="fa-solid fa-trash"></i>`
    deleteButton.classList.add(
      "p-2",
      "text-xs",
      "bg-red-600",
      "text-white",
      "rounded-lg",
      "hover:bg-red-700"
    )
    
    deleteButton.addEventListener("click", () => deleteUser(user.id))

    deleteTd.appendChild(deleteButton)
    tr.appendChild(deleteTd)

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

function deleteUser(userId) {
  allUsers = allUsers.filter((user) => user.id !== userId)
  updateTable()
}

function deleteFromServer(userId) {
  const url = `http://localhost:3000/persons/${userId}`
  fetch(url, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) {
        alert("Network response was not ok")
      }
      alert("User deleted successfully")
    })
    .catch((error) => alert("Failed to delete user"))
}

document.getElementById("search-input").addEventListener("input", (e) => {
  searchTerm = e.target.value.trim().toLowerCase()
  currentPage = 1
  updateTable()
})

document.getElementById("previous-button").addEventListener("click", () => {
  currentPage--
  updateTable()
})

document.getElementById("next-button").addEventListener("click", () => {
  currentPage++
  updateTable()
})

fetchData()
