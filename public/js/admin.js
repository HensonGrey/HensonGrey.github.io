

document.querySelectorAll('td').forEach(element => {
    element.addEventListener('contextmenu', e => {
        e.preventDefault();
        const reportId = element.closest(`tr`).dataset.id; // Assuming you have data-id attributes on your `td` elements

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                // Make fetch call to delete endpoint
                fetch(`/delete-report/${reportId}`, { method: 'DELETE' })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            Swal.fire({
                                title: "Deleted!",
                                text: "Your file has been deleted.",
                                icon: "success"
                            });
                            // Optionally remove the row from the table or refresh the page
                            element.closest('tr').remove(); // Remove the row
                        } else {
                            throw new Error(data.message); // Throw an error if not successful
                        }
                    })
                    .catch(error => {
                        Swal.fire({
                            title: "Error!",
                            text: error.toString(),
                            icon: "error"
                        });
                    });
            }
        });
    });
});
