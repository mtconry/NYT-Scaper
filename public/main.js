$(document).ready(function () {

    // Function to post a note to the server
    function sendNote(element) {
        let note = {};
        note.articleId = $(element).attr('data-id'),
            note.title = $('#noteTitleEntry').val().trim();
        note.body = $('#noteBodyEntry').val().trim();
        if(note.title && note.body){
            $.ajax({
                url: '/notes/createNote',
                type: 'POST',
                data: note,
                success: function (response) {
                    showNote(response, note.articleId);
                    $('#noteBodyEntry, #noteTitleEntry').val(' ');
                },
                error: function (error) {
                    showErrorModal(error);
                }
            });
        }
    }

    // Function to display error modal on ajax error
    function showErrorModal(error) {
        $('#error').modal('show');
    }

    // Function to display notes in notemodal
    function showNote(element, articleId) {
        let $title = $('<p>')
            .text(element.title)
            .addClass('noteTitle');
        let $deleteButton = $('<button>')
            .text('X')
            .addClass('deleteNote');
        let $note = $('<div>')
            .append($deleteButton, $title)
            .attr('data-note-id', element._id)
            .attr('data-article-id', articleId)
            .addClass('note')
            .appendTo('#noteArea');
    }

    // Event listener to reload root when user closes modal 
    // Show number of scraped articles
    $('#alertModal').on('hide.bs.modal', function (e) {
        window.location.href = '/';
    });

    // Click event to scrape new articles
    $('#scrape').on('click', function (e) {
        e.preventDefault();
        $.ajax({
            url: '/scrape/newArticles',
            type: 'GET',
            success: function (response) {
                $('#numArticles').text(response.count);
            },
            error: function (error) {
                showErrorModal(error);
            }
        });
    });

    // Click event that saves and article
    $(document).on('click', '#saveArticle', function (e) {
        let articleId = $(this).data('id');
        $.ajax({
            url: '/articles/save/' + articleId,
            type: 'GET',
            success: function (response) {
                window.location.href = '/';
            },
            error: function (error) {
                showErrorModal(error);
            }
        });
    });

    // Click event to open the note modal and populate with notes
    $('addNote').on('click', function (e) {
        $('#noteArea').empty();
        $('#noteTitleEntry, #noteBodyEntry').val('');
        let id = $(this).data('id');
        $('#submitNote, noteBodyEntry').val('');
        $.ajax({
            url: '/notes/getNotes/' + id,
            type: 'GET',
            success: function (data) {
                $.each(data.notes, function (i, item) {
                    showNote(item, id);
                });
                $('#noteModal').modal('show');
            },
            error: function (error) {
                showErrorModal(error);
            }
        });
    });

    // Click event to create a note
    $('#submitNote').on('click', function (e) {
        e.preventDefault();
        sendNote($(this));
    });

    // Keypress event to allow user to submit note with enter key
    $('#noteBodyEntry').on('keypress', function (e) {
        if (e.keyCode === 13) {
            sendNote($(this));
        }
    });

    // Delete an article from savedArticles (click event)
    $('.deleteArticle').on('click', function (e) {
        e.preventDefault();
        let id = $(this).data('id');
        $.ajax({
            url: '/articles/deleteArticle/'+id,
            type: 'DELETE',
            success: function (response) {
                window.location.href = '/articles/viewSaved';
            },
            error: function (error) {
                showErrorModal(error);
            }
        });
    });

    // Delete note from article (click event)
    $(document).on('click', '.deleteNote', function (e) {
        e.stopPropagation();
        let thisItem = $(this);
        let ids = {
            noteId: $(this).parent().data('note-id'),
            articleId: $(this).parent().data('article-id')
        };

        $.ajax({
            url: '/notes/deleteNote',
            type: 'POST',
            data: ids,
            success: function (response) {
                thisItem.parent().remove();
            },
            error: function (error) {
                showErrorModal(error);
            }
        });
    });

    // Click event to retrieve title and body for each note
    // Populate the modal with the article
    $(document).on('click', '.note', function (e) {
        e.stopPropagation();
        let id = $(this).data('note-id');
        $.ajax({
            url: '/notes/getSingleNote/' + id,
            type: 'GET',
            success: function (note) {
                $('#noteTitleEntry').val(note.title);
                $('#noteBodyEntry').val(note.body);
            },
            error: function (error) {
                console.log(error);
                showErrorModal(error);
            }
        });
    });

});
