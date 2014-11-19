$(function() {
  var host = "http://192.168.24.15:3000/api/";

  function Clear() {
    $('#info').empty();
    $('#back').empty();
    $('#add').empty();
    $('#contents').empty();
  }

  function SetInfo(elem) {
    $('#info').append(elem);
  }

  function SetBack() {
    var back = $("<button>back</button>").click(function() {
      ShowMylists();
    });
    $('#back').append(back);
  }

  function ReDraw(func) {
    Clear();
    func();
    SetBack();
  }

  function OpenMylist(mylist_id) {
    ReDraw(function () {
      function VideoLink(vid, title) {
        return $('<a target="_blank" href="http://www.nicovideo.jp/watch/' + vid + '"><p>' + title + '</p></a>');
      }
      function DeleteVideo(video_id) {
        $.ajax({
          type: "DELETE",
          url: host + "nico_mylists/" + mylist_id + "/nico_videos",
          data: {nico_video_id: video_id},
          success: function() {
            OpenMylist(mylist_id);
          }
        });
      }
      function AddVideo() {
        function PostVideo(id) {
          $.post(host + "nico_mylists/" + mylist_id + "/nico_videos",
            {vid: id}, function() {
            OpenMylist(mylist_id);
          }
          );
        }
        chrome.tabs.getSelected(null, function(tab) {
          if (tab.url.match(/^http:\/\/www\.nicovideo\.jp\/watch\/((sm|nm)\d+).*$/)) {
            PostVideo(RegExp.$1);
          }
        });
      }

      $.get(host + "nico_mylists/" + mylist_id, function(json) {
        SetInfo("<p>" + json.contents.title + "</p>");
        var videos = json.contents.videos;
        for (var i in videos) {
          var link = VideoLink(videos[i].vid, videos[i].title);
          var del = $('<button num="' + videos[i].nico_video_id + '">delete</button>');
          del.click(function() { DeleteVideo( $(this).attr("num")); });
          $('#contents').append(link).append(del);
        }
      });

      var add = $("<p><button>add current video</button</button></p>");
      add.children().click(function() {
        AddVideo();
      });
      $('#add').append(add);
    });
  }

  function ShowMylists() {
    ReDraw(function() {
      function MylistButton(mylist_id, title) {
        return $("<p><button mylist_id=" + mylist_id + ">" + title + "</button></p>")
      }
      function CreateButton() {
        var button = $('<p><button>create mylist</button></p>');
        button.children().click(function() {
          CreateMylist();
        });
        return button;
      }

      $.get(host + "nico_mylists/", function(json) {
        SetInfo("<p id=\"title\">" + "mylists" + "</p>");
        var cont = json.contents;
        for (var i in cont) {
          var button = MylistButton(cont[i].nico_mylist_id, cont[i].title)
          button.children().click(function() {
            var id =  $(this).attr("mylist_id");
            OpenMylist(id);
          });
          $('#contents').append(button);
        }
        $('#contents').append(CreateButton());
      });
    });
  }

  function CreateMylist() {
    ReDraw(function() {
      function PostButton() {
        var button = $('<button>post</button>');
        button.click(function() {
          $.post(host + "nico_mylists/",
            {title: $('#name').val()}, function() {
              ShowMylists();
            });
        });
        return button;
      }
      $('#contents').append($('<input type="text" id="name">'));
      $('#contents').append(PostButton());
    });
  }

  ShowMylists();
});
