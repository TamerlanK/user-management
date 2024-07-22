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
  updateUserCount()
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

    const actionsRow = document.createElement("td")
    actionsRow.classList.add("p-3", "text-center", "space-x-3")

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

    const editButton = document.createElement("button")
    editButton.innerHTML = `<i class="fa-solid fa-pen"></i>`
    editButton.classList.add(
      "p-2",
      "text-xs",
      "bg-slate-800",
      "text-white",
      "rounded-lg",
      "hover:bg-slate-900"
    )
    editButton.addEventListener("click", () => openEditModal(user))

    actionsRow.appendChild(deleteButton)
    actionsRow.appendChild(editButton)

    tr.appendChild(actionsRow)

    tableBody.appendChild(tr)
  })
}

function openEditModal(user) {
  document.getElementById('edit-id').value = user.id
  document.getElementById("edit-name").value = user.name
  document.getElementById("edit-address").value = user.address
  document.getElementById("edit-email").value = user.email
  document.getElementById("edit-phone_number").value = user.phone_number
  document.getElementById("edit-job").value = user.job
  document.getElementById("edit-company").value = user.company
  document.getElementById("edit-birthdate").value = user.birthdate.split("T")[0]

  document.getElementById("edit-user-modal").classList.remove("hidden")
  document.body.classList.add("overflow-hidden")
}

function editUser(updatedUser) {
  allUsers = allUsers.map((user) =>
    user.id === updatedUser.id
      ? {
          id: updatedUser.id,
          name: updatedUser.name,
          address: updatedUser.address,
          email: updatedUser.email,
          phone_number: updatedUser.phone_number,
          job: updatedUser.job,
          company: updatedUser.company,
          birthdate: updatedUser.birthdate,
        }
      : user
  )
  updateTable()
}

async function updateUserOnServer(user) {
  const url = `http://localhost:3000/persons/${user.id}`
  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network error!")
      }
      return res.json()
    })
    .then((updatedUser) => {
      console.log(`Updated user: ${updatedUser}`)
      editUser(updatedUser)
    })
    .catch((error) => alert("Failed to update user"))
}

const editUserModal = document.getElementById("edit-user-modal")
const editUserForm = document.getElementById("edit-user-form")
const closeEditModalButton = document.getElementById("close-edit-modal-button")

closeEditModalButton.addEventListener("click", () => {
  editUserModal.classList.add("hidden")
  document.body.classList.remove("overflow-hidden")
})

editUserForm.addEventListener("submit", async (e) => {
  e.preventDefault()
  const formData = new FormData(editUserForm)

  const user = {
    id: formData.get("edit-id"),
    name: formData.get("edit-name"),
    address: formData.get("edit-address"),
    email: formData.get("edit-email"),
    phone_number: formData.get("edit-phone_number"),
    job: formData.get("edit-job"),
    company: formData.get("edit-company"),
    birthdate: formData.get("edit-birthdate"),
  }

  await updateUserOnServer(user).then(() => {
    editUserModal.classList.add("hidden")
    editUserForm.reset()
    document.body.classList.remove("overflow-hidden")
  })
})

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

function updateUserCount() {
  document.getElementById(
    "users-count"
  ).textContent = `(${allUsers.length} users)`
}

function deleteUser(userId) {
  allUsers = allUsers.filter((user) => user.id !== userId)
  updateTable()
  deleteFromServer(userId)
}

function addUser(newUser) {
  allUsers.push(convertDataToUsers([newUser])[0])
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

async function addUserToServer(user) {
  const url = "http://localhost:3000/persons"
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network error!")
      }
      return res.json()
    })
    .then((newUser) => {
      addUser(newUser)
    })
    .catch((error) => alert("Failed to add user"))
}

const addUserModal = document.getElementById("add-user-modal")
const addUserButton = document.getElementById("add-user-button")
const addUserForm = document.getElementById("add-user-form")
const closeAddModalButton = document.getElementById("close-add-modal-button")

addUserButton.addEventListener("click", () => {
  addUserModal.classList.remove("hidden")
  document.body.classList.add("overflow-hidden")
})

closeAddModalButton.addEventListener("click", () => {
  addUserModal.classList.add("hidden")
  document.body.classList.remove("overflow-hidden")
})

addUserForm.addEventListener("submit", async (e) => {
  e.preventDefault()
  const formData = new FormData(addUserForm)
  const user = {
    name: formData.get("name"),
    address: formData.get("address"),
    email: formData.get("email"),
    phone_number: formData.get("phone_number"),
    job: formData.get("job"),
    company: formData.get("company"),
    birthdate: formData.get("birthdate"),
  }

  await addUserToServer(user).then(() => {
    addUserModal.classList.add("hidden")
    addUserForm.reset()
  })
})

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
