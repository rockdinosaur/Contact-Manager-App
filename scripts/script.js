$(function() {
  function Contact(name, email, tel, id) {
    this.name = name;
    this.email = email;
    this.tel = tel;
    this.id = String(id);
  }

  function slideUpShow($el) {
    var outerHeight = $el.css({
      display: "block"
    }).outerHeight();

    $el.css({
      overflow: "hidden",
      marginTop: outerHeight,
      outerHeight: 0
    }).animate({
      marginTop: 0,
      outerHeight: outerHeight
    }, 500);
  }

  var manager = {
    addListeners: function() {
      var self = this;
      $(".contact-form").submit(function(e) {
        e.preventDefault();
        var contactName = $("[name='name']").val();
        var contactEmail = $("[name='email']").val();
        var contactTel = $("[name='telephone']").val();
        if (self.editContactID) {
          self.contacts.forEach(function(contact) {
            if (contact.id === self.editContactID) {
              contact.name = contactName;
              contact.email = contactEmail;
              contact.tel = contactTel;
            }
          })
        } else {
          self.addContact(contactName, contactEmail, contactTel);
        }
        $(this).find("form").trigger("reset");
        self.hideContactForm();
        self.renderMain();
      })

      $("[name='cancel']").on("keypress click", function(e) {
        e.preventDefault();
        if (e.which === 13 || e.type === 'click') {
          $("form").trigger("reset");
          self.hideContactForm();
          self.renderMain();
        }
      })

      $(".add").click(function(e) {
        e.preventDefault();
        self.editContactID = null;
        $(".contact-form h1").text("Create Contact");
        self.hideMain();
        self.renderContactForm();
      })

      $(".contact-list").click(function(e) {
        e.preventDefault();
        var $target = $(e.target);
        var targetID = $target.parents(".contact-container").attr("data-contact-id");
        if ($target.hasClass("delete")) {
          self.deleteContact(targetID);
        } else if ($target.hasClass("edit")) {
          self.editContactID = targetID;
          self.editContact(targetID);
        }
      })

      $("[name='search']").keyup(function(e) {
        var searchValue = $(this).val();
        $(".contact-container").hide();
        var contactIDsToDisplay = [];
        self.contacts.forEach(function(contact) {
          if (contact.name.slice(0, searchValue.length).toLowerCase() === searchValue.toLowerCase()) {
            contactIDsToDisplay.push(contact.id);
          }
        })
        if (contactIDsToDisplay.length === 0) {
          $(".warning .find-letter").text(searchValue);
          $(".warning").show();
        } else {
          $(".warning").hide();
          $(".contact-container").each(function() {
            if (contactIDsToDisplay.includes($(this).attr("data-contact-id"))) {
              $(this).show();
            }
          })
        }
      })
    },

    addContact: function(name, email, tel) {
      this.counter += 1;
      this.contacts.push(new Contact(name, email, tel, this.counter));
    },

    deleteContact: function(targetID) {
      var result = window.confirm("Are you sure you want to delete this contact?");
      if (result) {
        $("[data-contact-id=" + targetID + "]").remove();
        var idxToRemove;
        this.contacts.forEach(function(contact, idx) {
          if (contact.id === targetID) {
            idxToRemove = idx;
          }
        })
        this.contacts.splice(idxToRemove, 1);
        this.renderMain();
      } else {
        return;
      }
    },

    editContact: function(targetID) {
      $(".main-content").slideUp();
      $(".contact-form h1").text("Edit Contact");
      slideUpShow($(".contact-form"));
    },

    renderContacts: function() {
      var contactTemplate = $("#contactTemplate").html();
      var compiledTemplate = Handlebars.compile(contactTemplate);
      var contactHTML = compiledTemplate({ contacts: this.contacts });
      $(".contact-list").html(contactHTML);
    },

    displayMenuOrNot: function() {
      if (this.contacts.length === 0) {
        $(".no-contacts").show();
      } else {
        $(".no-contacts").hide();
      }
    },

    hideContactForm: function() {
      $(".contact-form").slideUp();
    },

    hideMain: function() {
      $(".main-content").slideUp();
    },

    renderContactForm: function() {
      slideUpShow($(".contact-form"));
    },

    renderMain: function() {
      this.displayMenuOrNot();
      this.renderContacts();
      slideUpShow($(".main-content"));
    },

    init: function() {
      this.addListeners();
      this.contacts = [];
      this.counter = 0;
      this.editContactID = null;
    }
  }

  manager.init();
})
