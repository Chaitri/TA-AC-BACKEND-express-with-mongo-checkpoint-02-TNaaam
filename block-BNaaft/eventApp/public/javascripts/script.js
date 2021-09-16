const filterBtn = document.getElementById('filter');
const filterForm = document.getElementById('filterForm');

function handleFilter() {
  filterForm.classList.toggle('hidden');
}

filterBtn.addEventListener('click', handleFilter);
