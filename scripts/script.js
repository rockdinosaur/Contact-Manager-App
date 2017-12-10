$(function() {
  function Contact(name, email, tel, tag, id) {
    this.name = name;
    this.email = email;
    this.tel = tel;
    this.tag = tag;
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
        var contactTag = self.getContactTag();
        if (self.editContactID) {
          self.contacts.forEach(function(contact) {
            if (contact.id === self.editContactID) {
              contact.name = contactName;
              contact.email = contactEmail;
              contact.tel = contactTel;
              contact.tag = contactTag;
            }
          })
        } else {
          self.addContact(contactName, contactEmail, contactTel, contactTag);
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
        } else if ($target.hasClass("tag")) {
          self.displayContactsWithTag($target.text());
          $("[name='remove-filter']").show();
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

      $("[name='tags']").change(function(e) {
        if ($(this).val() === "Other") {
          $(".specific-tag").show();
        } else {
          $(".specific-tag").hide();
        }
      })

      $("[name='remove-filter']").click(function(e) {
        e.preventDefault();
        $(".contact-container").show();
        $(this).hide();
      })
    },

    addContact: function(name, email, tel, tag) {
      this.counter += 1;
      this.contacts.push(new Contact(name, email, tel, tag, this.counter));
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
      var currentContactName;
      var currentContactEmail;
      var currentContactTel;
      var currentContactTag;
      var selectableTags = [];

      $("[name='tags'] option").each(function() {
        selectableTags.push($(this).text());
      });
      selectableTags.pop();

      this.contacts.forEach(function(contact) {
        if (contact.id === this.editContactID) {
          currentContactName = contact.name;
          currentContactEmail = contact.email;
          currentContactTel = contact.tel;
          currentContactTag = contact.tag;
        }
      }, this)

      if (!selectableTags.includes(currentContactTag)) {
        $("[name='tags'] option").last().attr("selected", true);
        $(".specific-tag").show();
        $(".specific-tag [name='specific-tag']").val(currentContactTag);
      } else {
        $(".specific-tag").hide();
        $("[name='tags'] option").each(function() {
          if ($(this).text() === currentContactTag) {
            $(this).attr("selected", true);
          }
        })
      }

      $(".main-content").slideUp();
      $(".contact-form h1").text("Edit Contact");
      $(".contact-form [name='name']").val(currentContactName);
      $(".contact-form [name='email']").val(currentContactEmail);
      $(".contact-form [name='telephone']").val(currentContactTel);
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

    getContactTag: function() {
      var $specifiedTag = $(".specific-tag");
      if ($specifiedTag.filter(":visible").length > 0) {
        return $specifiedTag.find("[name='specific-tag']").val();
      } else {
        return $("[name='tags']").val();
      }
    },

    displayContactsWithTag: function(tag) {
      $(".contact-container").hide();
      $(".contact-container").each(function() {
        if ($(this).find(".tag").text() === tag) {
          $(this).show();
        }
      })
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
