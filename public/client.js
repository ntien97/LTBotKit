var converter = new showdown.Converter();
converter.setOption('openLinksInNewWindow', true);
const RESULT_MESSAGE_WIDTH_TRANS = 310;
const key2vn = {
  'price': "Giá",
  'transaction_type': "Loại GD",
  'area': 'Diện tích',
  'realestate_type': "Loại BĐS",
  'addr_district': "Quận",
  'addr_city': "TP",
  'potential': "Tiềm năng",
  'location': "Địa điểm",
  'interior_floor': "Tầng",
  'interior_room': "Phòng",
  'surrounding_characteristics': "Đặc điểm",
  'position': "Vị trí",
  'legal': "Giấy phép",
  'orientation': "Hướng",
  'surrounding_place': "Gần",
  'addr_ward': "Phường",
  'addr_street': "Đường"
}

const MAX_ATTR = 5;

var Botkit = {
  config: {
    ws_url: (location.protocol === 'https:' ? 'wss' : 'ws') + '://' + location.host,
    reconnect_timeout: 3000,
    max_reconnect: 5
  },
  options: {
    sound: false,
    use_sockets: true
  },
  reconnect_count: 0,
  slider_message_count: 0,
  list_attr_count: 0,
  list_intent_count: 0,
  guid: null,
  current_user: null,
  on: function (event, handler) {
    this.message_window.addEventListener(event, function (evt) {
      handler(evt.detail);
    });
  },
  trigger: function (event, details) {
    var event = new CustomEvent(event, {
      detail: details
    });
    this.message_window.dispatchEvent(event);
  },
  request: function (url, body) {
    var that = this;
    return new Promise(function (resolve, reject) {
      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
          if (xmlhttp.status == 200) {
            var response = xmlhttp.responseText;
            var message = null;
            try {
              message = JSON.parse(response);
            } catch (err) {
              reject(err);
              return;
            }
            resolve(message);
          } else {
            reject(new Error('status_' + xmlhttp.status));
          }
        }
      };

      xmlhttp.open("POST", url, true);
      xmlhttp.setRequestHeader("Content-Type", "application/json");
      xmlhttp.send(JSON.stringify(body));
    });

  },
  send: function (text, e) {
    var that = this;
    if (e) e.preventDefault();
    if (!text) {
      return;
    }
    var message = {
      type: 'outgoing',
      text: text
    };

    this.clearReplies();
    that.renderMessage(message);

    that.deliverMessage({
      type: 'message',
      text: text,
      user: this.guid,
      channel: this.options.use_sockets ? 'socket' : 'webhook'
    });

    this.input.value = '';

    this.trigger('sent', message);

    return false;
  },
  sendCustom: function (text, payload, e) {
    console.log("here")
    var that = this;
    if (e) e.preventDefault();
    if (!text) {
      return;
    }
    var message = {
      type: 'outgoing',
      text: text
    };

    this.clearReplies();
    that.renderMessage(message);

    that.deliverMessage({
      ...payload,
      type: 'message',
      text: text,
      user: this.guid,
      channel: this.options.use_sockets ? 'socket' : 'webhook'
    });

    this.input.value = '';

    this.trigger('sent', message);

    return false;
  },
  deliverMessage: function (message) {
    if (this.options.use_sockets) {
      this.socket.send(JSON.stringify(message));
    } else {
      this.webhook(message);
    }
  },
  getHistory: function (guid) {
    var that = this;
    if (that.guid) {
      that.request('/botkit/history', {
        user: that.guid
      }).then(function (history) {
        if (history.success) {
          that.trigger('history_loaded', history.history);
        } else {
          that.trigger('history_error', new Error(history.error));
        }
      }).catch(function (err) {
        that.trigger('history_error', err);
      });
    }
  },
  webhook: function (message) {
    var that = this;

    that.request('/botkit/receive', message).then(function (message) {
      that.trigger(message.type, message);
    }).catch(function (err) {
      that.trigger('webhook_error', err);
    });

  },
  connect: function (user) {

    var that = this;

    if (user && user.id) {
      Botkit.setCookie('botkit_guid', user.id, 1);

      user.timezone_offset = new Date().getTimezoneOffset();
      that.current_user = user;
      console.log('CONNECT WITH USER', user);
    }

    // connect to the chat server!
    if (that.options.use_sockets) {
      that.connectWebsocket(that.config.ws_url);
    } else {
      that.connectWebhook();
    }

  },
  connectWebhook: function () {
    var that = this;
    if (Botkit.getCookie('botkit_guid')) {
      that.guid = Botkit.getCookie('botkit_guid');
      connectEvent = 'welcome_back';
    } else {
      that.guid = that.generate_guid();
      Botkit.setCookie('botkit_guid', that.guid, 1);
    }

    that.getHistory();

    // connect immediately
    that.trigger('connected', {});
    that.webhook({
      type: connectEvent,
      user: that.guid,
      channel: 'webhook',
    });

  },
  connectWebsocket: function (ws_url) {
    var that = this;
    // Create WebSocket connection.
    that.socket = new WebSocket(ws_url);

    var connectEvent = 'hello';
    if (Botkit.getCookie('botkit_guid')) {
      that.guid = Botkit.getCookie('botkit_guid');
      connectEvent = 'welcome_back';
    } else {
      that.guid = that.generate_guid();
      Botkit.setCookie('botkit_guid', that.guid, 1);
    }

    that.getHistory();

    // Connection opened
    that.socket.addEventListener('open', function (event) {
      console.log('CONNECTED TO SOCKET');
      that.reconnect_count = 0;
      that.trigger('connected', event);
      that.deliverMessage({
        type: connectEvent,
        user: that.guid,
        channel: 'socket',
        user_profile: that.current_user ? that.current_user : null,
      });
    });

    that.socket.addEventListener('error', function (event) {
      console.error('ERROR', event);
    });

    that.socket.addEventListener('close', function (event) {
      console.log('SOCKET CLOSED!');
      that.trigger('disconnected', event);
      if (that.reconnect_count < that.config.max_reconnect) {
        setTimeout(function () {
          console.log('RECONNECTING ATTEMPT ', ++that.reconnect_count);
          that.connectWebsocket(that.config.ws_url);
        }, that.config.reconnect_timeout);
      } else {
        that.message_window.className = 'offline';
      }
    });

    // Listen for messages
    that.socket.addEventListener('message', function (event) {
      var message = null;
      try {
        message = JSON.parse(event.data);
      } catch (err) {
        that.trigger('socket_error', err);
        return;
      }

      that.trigger(message.type, message);
    });
  },
  clearReplies: function () {
    this.replies.innerHTML = '';
  },
  quickReply: function (payload) {
    this.send(payload);
  },
  focus: function () {
    this.input.focus();
  },
  renderMessage: function (message) {
    var that = this;
    console.log(message)
    if (message.graph) {
      var graph = message.graph;
      const REALESTATE_ATTR = ['interior_room', 'position', 'surrounding_characteristics', 'interior_floor', 'surrounding_place', 'realestate_type', 'orientation', 'legal', 'transaction_type']
      const REALESTATE_ENTITY = ['price', 'potential', 'area', 'location']
      const LOCATION_ATTR = ['addr_street', 'addr_ward', 'addr_city', 'addr_district']
      var needActivate = [];
      var needDeactivate = [];
      for (i = 0; i < REALESTATE_ATTR.length; i++) {
        (function (key) {
          var id = "#" + key;
          if (graph[key] && graph[key]["value_raw"] && graph[key]["value_raw"].length > 0) {
            var text = graph[key]["value_raw"][0];
            for (var i = 1; i < graph[key]["value_raw"].length; i++) {
              text += ", " + graph[key]["value_raw"][i];
            }
            $($(id).find(".content")[0]).text(text);
            $($(id).find(".content")[0]).show();
            $(id).css('opacity', '1');

            needActivate.push(key);
          } else {
            // console.log($(id).find(".content"))
            $($(id).find(".content")[0]).text("");
            $($(id).find(".content")[0]).hide();
            $(id).css('opacity', '0.5');
            needDeactivate.push(key);
          }
        })(REALESTATE_ATTR[i])
      }
      for (i = 0; i < REALESTATE_ENTITY.length; i++) {
        (function (key) {
          var id = "#" + key;
          if (graph[key] && graph[key]["value_raw"] && graph[key]["value_raw"].length > 0) {
            var text = graph[key]["value_raw"][0];
            for (var i = 1; i < graph[key]["value_raw"].length; i++) {
              text += ", " + graph[key]["value_raw"][i];
            }
            $($(id).find(".content")[0]).text(text);
            $($(id).find(".content")[0]).show();
            $(id).css('opacity', '1');
            needActivate.push(key);
          } else {
            $($(id).find(".content")[0]).text("");
            $($(id).find(".content")[0]).hide();
            $(id).css('opacity', '0.5');
            needDeactivate.push(key);
          }
        })(REALESTATE_ENTITY[i])
      }
      var locationOn = false;
      graphLocation = graph["location"]
      if (graphLocation) {
        for (i = 0; i < LOCATION_ATTR.length; i++) {
          (function (key) {
            var id = "#" + key;
            if (graphLocation[key] && graphLocation[key]["value_raw"] && graphLocation[key]["value_raw"].length > 0) {
              var text = graphLocation[key]["value_raw"][0];
              for (var i = 1; i < graphLocation[key]["value_raw"].length; i++) {
                text += ", " + graphLocation[key]["value_raw"][i];
              }
              $($(id).find(".content")[0]).text(text);
              $($(id).find(".content")[0]).show();
              $(id).css('opacity', '1');
              needActivate.push(key);
              locationOn = true;
            } else {
              $($(id).find(".content")[0]).text("");
              $($(id).find(".content")[0]).hide();
              $(id).css('opacity', '0.5');
              needDeactivate.push(key);
            }
          })(LOCATION_ATTR[i])
        }
        if (locationOn === true) {
          $("#location").css('opacity', '1');
          needActivate.push("location");
        } else {
          $("#location").css('opacity', '0.5');
          needDeactivate.push("location");
        }
      }
      if (graph.current_intents) {
        for (var i = 0; i < graph.current_intents.length; i++) {
          (function (key) {
            var id = "#" + key;
            $(id).css('opacity', '1');
            $(id).css('background', 'red');

            if (key !== "real_estate") {
              var text = ((key === "addr_district") ? (graph["location"][key]["identifier"] ? graph["location"][key]["identifier"] : "") : (graph[key]["identifier"] ? graph[key]["identifier"] : ""));
              $($(id).find(".content")[0]).text(text);
              $($(id).find(".content")[0]).show();
              needActivate.push(key);
            }
            if (key === "addr_district") {
              $("#location").css('opacity', '1');
              $("#location").css('background', 'red');
              needActivate.push("location");
            }
          })(graph.current_intents[i])
        }
      } else {
        for (var i = 0; i < REALESTATE_ENTITY.length; i++) {
          (function (key) {
            var id = "#" + key;
            $(id).css('opacity', '.5');
            $(id).css('background', 'var(--entity-color)');
            $($(id).find(".content")[0]).text("");
            $($(id).find(".content")[0]).hide();
            needDeactivate.push(key);
          })(REALESTATE_ENTITY[i])
        }
        $("#real_estate").css('opacity', '.5');
        $("#real_estate").css('background', 'var(--entity-color)');
        $($("#real_estate").find(".content")[0]).text("");
        $($("#real_estate").find(".content")[0]).hide();
        $("#addr_district").css('opacity', '.5');
        $("#addr_district").css('background', 'var(--entity-color)');
        $($("#addr_district").find(".content")[0]).hide();
        needDeactivate.push("addr_district");
      }
      for (var i = 0; i < needDeactivate.length; i++) {
        deactivateLine(needDeactivate[i]);
      }
      for (var i = 0; i < needActivate.length; i++) {
        activateLine(needActivate[i]);
      }
      for (var key in myLine) {
        if (!myLine.hasOwnProperty(key)) continue;
        var obj = myLine[key];
        obj.position();
      }
    }
    if (!message.show_results) {
      if (!message.attr_list) {
        if (!message.intent_dict) {
          if (!that.next_line) {
            that.next_line = document.createElement('div');
            that.message_list.appendChild(that.next_line);
          }
          if (message.text) {
            message.html = converter.makeHtml(message.text);
          }

          that.next_line.innerHTML = that.message_template({
            message: message
          });
          if (!message.isTyping) {
            delete (that.next_line);
          }
        } else {
          if (!that.next_line) {
            that.next_line = document.createElement('div');
            that.message_list.appendChild(that.next_line);
          }
          if (message.intent_dict) {
            message.intentListId = this.list_intent_count;
            this.list_intent_count += 1;
          }
          that.next_line.innerHTML = that.message_intent_template({
            message: message
          });
          if (message.intent_dict) {

            console.log(message.intent_dict)
            var count = 0;
            if (message.intent_dict["location"]) count += 1;
            if (message.intent_dict["addr_district"]) count += 1;
            if (message.intent_dict["potential"]) count += 1;
            var showOptions = true;
            if (count > 1) showOptions = false;
            var filler = document.getElementById("intent-mask-" + message.intentListId);

            console.log(filler);

            if (message.intent_dict["price"]) {
              var txt = "";
              var obj = message.intent_dict["price"];
              if (obj.response && obj.value) {
                txt += obj.response + " " + Math.round(obj.value) + " vnd";
              }
              if (txt !== "") {
                var t = $(`<div class="message-text">${txt}</div>`)[0];
                filler.appendChild(t);
              }
            }
            if (message.intent_dict["area"]) {
              var txt = "";
              var obj = message.intent_dict["area"];
              if (obj.response && obj.value) {
                txt += obj.response + " " + Math.round(obj.value) + " m2";
              }
              if (txt !== "") {
                var t = $(`<div class="message-text">${txt}</div>`)[0];
                filler.appendChild(t);
              }
            }

            for (var key in message.intent_dict) {
              // skip loop if the property is from prototype
              if (!message.intent_dict.hasOwnProperty(key)) continue;
              if (key === "price" || key == "area") {
                continue;
              }

              var obj = message.intent_dict[key];
              if (showOptions === true) {
                var txt = "";
                if (obj.response && obj.value) {
                  txt += obj.response;
                }
                if (txt !== "") {
                  var t = $(`<div class="message-text">${txt}</div>`)[0];
                  filler.appendChild(t);
                } else {
                  continue;
                }
                for (var i = 0; i < obj.value.length; i++) {
                  (function (ele) {
                    var li = $(`<div class="attr" lt-key="${key}">${ele}</div>`)[0];
                    $(li).click(() => {
                      var key = $(li).attr("lt-key");
                      var value = $(li).text()

                      var anotherThat = that;

                      var response = "Xem kết quả với " + key2vn[key] + ": \"" + value.trim() + "\"";
                      var message = {
                        type: 'outgoing',
                        text: response
                      };
                      // console.log(that)
                      that.clearReplies();
                      anotherThat.renderMessage(message);

                      anotherThat.deliverMessage({
                        type: 'message',
                        filterAttr: { value: encodeURI(value), key: key },
                        user: that.guid,
                        channel: that.options.use_sockets ? 'socket' : 'webhook'
                      });

                      that.input.value = '';

                      that.trigger('sent', message);

                      console.log($($(li).parent()[0]).find(".attr"))
                      $($(li).parent()[0]).find(".attr").remove();
                      return false;
                    })
                    filler.appendChild(li);

                  })(obj.value[i])
                }
              } else {
                var txt = "";
                if (obj.response && obj.value && obj.value.length > 0) {
                  txt += obj.response + " ";
                  for (var i = 0; i < obj.value.length; i++) {
                    txt += obj.value[i] + ", "
                  }
                }
                if (txt !== "") {
                  var t = $(`<div class="message-text">${txt}</div>`)[0];
                  filler.appendChild(t);
                } else {
                  continue;
                }
              }

            }

            for (var i = 0; i < message.intent_dict.length; i++) {
              (function (ele) {
                var li = $(`<div class="attr" lt-key="${ele.key}">${ele.value}<span class="close">${close}</span>
                </div>`)[0]
                $(li).click(() => {

                  var key = $(li).attr("lt-key");
                  if (key == "location") {
                    key = "addr_district";
                  }
                  var value = $(li).text()

                  var anotherThat = that;

                  var response = "Bỏ yêu cầu \"" + value.trim() + "\"";
                  var message = {
                    type: 'outgoing',
                    text: response
                  };
                  // console.log(that)
                  that.clearReplies();
                  anotherThat.renderMessage(message);

                  anotherThat.deliverMessage({
                    type: 'message',
                    clearAttr: { value: value, key: key },
                    user: that.guid,
                    channel: that.options.use_sockets ? 'socket' : 'webhook'
                  });

                  that.input.value = '';

                  that.trigger('sent', message);

                  console.log($($(li).parent()[0]).find(".attr"))
                  $($(li).parent()[0]).find(".attr").remove();
                  return false;

                })
                filler.appendChild(li);
              })(message.intent_dict[i])
            }
          }
          if (message.text) {
            var t = $(`<div class="message-text">${message.text}</div>`)[0];
            filler.appendChild(t);
          }
          if (!message.isTyping) {
            delete (that.next_line);
          }
        }
      }
      else {
        if (!that.next_line) {
          that.next_line = document.createElement('div');
          that.message_list.appendChild(that.next_line);
        }
        if (message.attr_list) {
          message.attrListId = this.list_attr_count;
          this.list_attr_count += 1;
        }
        that.next_line.innerHTML = that.message_list_template({
          message: message
        });
        if (message.attr_list) {

          console.log(message.attr_list)
          var filler = document.getElementById("list-mask-" + message.attrListId);
          if (message.text) {
            var t = $(`<div class="message-text">${message.text}</div>`)[0];
            filler.appendChild(t);
          }
          console.log(filler);
          var close = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" title="close the chat" ><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path> <path d="M0 0h24v24H0z" fill="none"></path></svg>`
          for (var i = 0; i < message.attr_list.length; i++) {
            (function (ele) {
              var li = $(`<div class="attr" lt-key="${ele.key}">${ele.value}<span class="close">${close}</span>
              </div>`)[0]
              $(li).click(() => {

                var key = $(li).attr("lt-key");
                var value = $(li).text()

                var anotherThat = that;

                var response = "Bỏ yêu cầu \"" + value.trim() + "\"";
                var message = {
                  type: 'outgoing',
                  text: response
                };
                // console.log(that)
                that.clearReplies();
                anotherThat.renderMessage(message);

                anotherThat.deliverMessage({
                  type: 'message',
                  clearAttr: { value: value, key: key },
                  user: that.guid,
                  channel: that.options.use_sockets ? 'socket' : 'webhook'
                });

                that.input.value = '';

                that.trigger('sent', message);

                console.log($($(li).parent()[0]).find(".attr"))
                $($(li).parent()[0]).find(".attr").remove();
                return false;

              })
              filler.appendChild(li);
            })(message.attr_list[i])
          }
        }
        if (!message.isTyping) {
          delete (that.next_line);
        }
      }
    } else {
      if (!that.next_line) {
        that.next_line = document.createElement('div');
        that.message_list.appendChild(that.next_line);
      }
      if (message.show_results) {

        message.resultSliderId = 'items-' + this.slider_message_count;
        this.slider_message_count += 1;
      }
      that.next_line.className += " message-result-margin"
      that.next_line.innerHTML = that.message_slider_template({
        message: message
      });
      if (message.show_results) {
        var list = this.renderResultMessages(message.show_results, message.concerned_attributes);

        if (message.text) {
          var parentDiv = $(`#mask-${message.resultSliderId}`).parent()[0]
          console.log(parentDiv);
          var t = $(`<div class="message-text-slider">${message.text[0]}</div>`)[0];
          var u = $(`<div class="message-text-slider">${message.text[1]}</div>`)[0];
          parentDiv.prepend(t);
          parentDiv.append(u);
        }
        var sliderContainer = document.getElementById(`wrapper-${message.resultSliderId}`);
        list.forEach(function (element) {
          sliderContainer.appendChild(element);
        })
        sliderContainer.setAttribute("max-width", list.length * 310);
        var a_left = $('<div class="carousel-prev"></div>')[0]
        var a_right = $('<div class="carousel-next"></div>')[0]
        var left = $('<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"></path> <path d="M0-.5h24v24H0z" fill="none"></path></svg>')[0]
        var right = $('<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"></path> <path d="M0-.25h24v24H0z" fill="none"></path></svg>')[0]
        a_left.append(left)
        a_right.append(right)
        var mask = document.getElementById(`mask-${message.resultSliderId}`);
        console.log(a_left)
        $(a_left).hide();
        $(a_right).click(() => {
          var id = `wrapper-${message.resultSliderId}`;
          var wrapperWidth = parseInt($("#" + id).attr("max-width"));
          var marginLeft = parseInt($("#" + id).css('margin-left'));
          var offset = RESULT_MESSAGE_WIDTH_TRANS;
          marginLeft -= offset;
          if (marginLeft >= (-wrapperWidth + RESULT_MESSAGE_WIDTH_TRANS)) {
            var str = marginLeft + "px !important";
            $("#" + id).attr('style', 'margin-left: ' + str);
            if (marginLeft - offset < (-wrapperWidth + RESULT_MESSAGE_WIDTH_TRANS)) {
              $(a_right).hide();
            }
          }
          $(a_left).show();
        })
        $(a_left).click(() => {
          var id = `wrapper-${message.resultSliderId}`;
          var marginLeft = parseInt($("#" + id).css('margin-left'));
          var offset = RESULT_MESSAGE_WIDTH_TRANS;
          marginLeft += offset;
          if (marginLeft >= 0) {
            marginLeft = 0;
            $(a_left).hide();
          }
          var str = marginLeft + "px !important";
          $("#" + id).attr('style', 'margin-left: ' + str);
          $(a_right).show();
        })
        mask.appendChild(a_left);
        mask.appendChild(a_right);
      }
      if (!message.isTyping) {
        delete (that.next_line);
      }
    }

  },
  triggerScript: function (script, thread) {
    this.deliverMessage({
      type: 'trigger',
      user: this.guid,
      channel: 'socket',
      script: script,
      thread: thread
    });
  },
  identifyUser: function (user) {

    user.timezone_offset = new Date().getTimezoneOffset();

    this.guid = user.id;
    Botkit.setCookie('botkit_guid', user.id, 1);

    this.current_user = user;

    this.deliverMessage({
      type: 'identify',
      user: this.guid,
      channel: 'socket',
      user_profile: user,
    });
  },
  receiveCommand: function (event) {
    switch (event.data.name) {
      case 'trigger':
        // tell Botkit to trigger a specific script/thread
        console.log('TRIGGER', event.data.script, event.data.thread);
        Botkit.triggerScript(event.data.script, event.data.thread);
        break;
      case 'identify':
        // link this account info to this user
        console.log('IDENTIFY', event.data.user);
        Botkit.identifyUser(event.data.user);
        break;
      case 'connect':
        // link this account info to this user
        Botkit.connect(event.data.user);
        break;
      default:
        console.log('UNKNOWN COMMAND', event.data);
    }
  },
  sendEvent: function (event) {

    if (this.parent_window) {
      this.parent_window.postMessage(event, '*');
    }

  },
  setCookie: function (cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  },
  getCookie: function (cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  },
  generate_guid: function () {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  },
  renderResultMessages: function (results, concerned_attributes) {
    var elements = [];
    var len = Math.min(10, results.length);
    for (var r = 0; r < len; r++) {
      (function (result) {

        // var li = document.createElement('div');
        // li.className += " message-result"
        // var span = document.createElement('p');
        // span.innerText = result.tittle;
        // li.appendChild(span);

        var title = `<div class="tittle"><a href="${result.url}" target="#">${result.tittle}</div></marquee>`

        var list_row = '';
        var count = 0;
        for (var i = 0; i < concerned_attributes.length; i++)
          if (result[concerned_attributes[i]] && count < MAX_ATTR) {
            if (concerned_attributes[i] === "orientation" & result[concerned_attributes[i]] === "Không xác định") {
              continue;
            }
            if (concerned_attributes[i] === "addr_district" || concerned_attributes[i] === "potential") {
              continue;
            }
            count += 1;
            var val = result[concerned_attributes[i]]
            var row = `<tr><th>${key2vn[concerned_attributes[i]]}</th><td>: ${val}</td></tr>`;
            list_row += row;
          }
        list_row += `<tr><th>Địa chỉ</th><td>: ${result["address"]}</td></tr>`;
        list_row += `<tr><th>Ngày đăng</th><td>: ${result["publish_date"]}</td></tr>`;
        var table = `<table>${list_row}</table>`

        var li = $('<div class="message-result">' + title + table + '</div>')[0]
        elements.push(li);
      })(results[r]);
    }
    return elements;
  },
  boot: function (user) {

    console.log('Booting up');

    var that = this;


    that.message_window = document.getElementById("message_window");

    that.message_list = document.getElementById("message_list");

    var source = document.getElementById('message_template').innerHTML;
    that.message_template = Handlebars.compile(source);

    var custom_source = document.getElementById('message_slider_template').innerHTML;
    that.message_slider_template = Handlebars.compile(custom_source);

    var custom_source_2 = document.getElementById('message_list_template').innerHTML;
    that.message_list_template = Handlebars.compile(custom_source_2);

    var custom_source_3 = document.getElementById('message_intent_template').innerHTML;
    that.message_intent_template = Handlebars.compile(custom_source_3);

    that.replies = document.getElementById('message_replies');

    that.input = document.getElementById('messenger_input');

    that.focus();

    that.on('connected', function () {
      that.message_window.className = 'connected';
      that.input.disabled = false;
      that.sendEvent({
        name: 'connected'
      });
    })

    that.on('disconnected', function () {
      that.message_window.className = 'disconnected';
      that.input.disabled = true;
    });

    that.on('webhook_error', function (err) {

      alert('Error sending message!');
      console.error('Webhook Error', err);

    });

    that.on('typing', function () {
      that.clearReplies();
      that.renderMessage({
        isTyping: true
      });
    });

    that.on('sent', function () {
      if (that.options.sound) {
        var audio = new Audio('sent.mp3');
        audio.play();
      }
    });

    that.on('message', function () {
      if (that.options.sound) {
        var audio = new Audio('beep.mp3');
        audio.play();
      }
    });

    that.on('message', function (message) {

      that.renderMessage(message);

    });

    that.on('message', function (message) {
      if (message.goto_link) {
        window.location = message.goto_link;
      }
    });


    that.on('message', function (message) {
      that.clearReplies();
      if (message.quick_replies) {

        var list = document.createElement('ul');

        var elements = [];
        for (var r = 0; r < message.quick_replies.length; r++) {
          (function (reply) {

            var li = document.createElement('li');
            var el = document.createElement('a');
            el.innerHTML = reply.title;
            el.href = '#';

            el.onclick = function () {
              that.quickReply(reply.payload);
            }

            li.appendChild(el);
            list.appendChild(li);
            elements.push(li);

          })(message.quick_replies[r]);
        }

        that.replies.appendChild(list);

        // uncomment this code if you want your quick replies to scroll horizontally instead of stacking
        // var width = 0;
        // // resize this element so it will scroll horizontally
        // for (var e = 0; e < elements.length; e++) {
        //     width = width + elements[e].offsetWidth + 18;
        // }
        // list.style.width = width + 'px';

        if (message.disable_input) {
          that.input.disabled = true;
        } else {
          that.input.disabled = false;
        }
      } else {
        that.input.disabled = false;
      }
    });

    that.on('message', function (message) {
      that.clearReplies();
      if (message.force_result) {

        var list = document.createElement('ul');

        var elements = [];
        for (var r = 0; r < message.force_result.length; r++) {
          (function (reply) {

            var li = document.createElement('li');
            var el = document.createElement('a');
            el.innerHTML = reply.title;
            el.href = '#';

            el.onclick = function () {

              console.log(reply.title, reply.payload);
              that.sendCustom(reply.title, reply.payload);
            }

            li.appendChild(el);
            list.appendChild(li);
            elements.push(li);

          })(message.force_result[r]);
        }

        that.replies.appendChild(list);

        // uncomment this code if you want your quick replies to scroll horizontally instead of stacking
        // var width = 0;
        // // resize this element so it will scroll horizontally
        // for (var e = 0; e < elements.length; e++) {
        //     width = width + elements[e].offsetWidth + 18;
        // }
        // list.style.width = width + 'px';

        if (message.disable_input) {
          that.input.disabled = true;
        } else {
          that.input.disabled = false;
        }
      } else {
        that.input.disabled = false;
      }
    });

    that.on('history_loaded', function (history) {
      if (history) {
        for (var m = 0; m < history.length; m++) {
          that.renderMessage({
            text: history[m].text,
            type: history[m].type == 'message_received' ? 'outgoing' : 'incoming', // set appropriate CSS class
          });
        }
      }
    });


    if (window.self !== window.top) {
      // this is embedded in an iframe.
      // send a message to the master frame to tell it that the chat client is ready
      // do NOT automatically connect... rather wait for the connect command.
      that.parent_window = window.parent;
      window.addEventListener("message", that.receiveCommand, false);
      that.sendEvent({
        type: 'event',
        name: 'booted'
      });
      console.log('Messenger booted in embedded mode');

    } else {

      console.log('Messenger booted in stand-alone mode');
      // this is a stand-alone client. connect immediately.
      that.connect(user);
    }

    return that;
  }
};


(function () {
  // your page initialization code here
  // the DOM will be available here
  Botkit.boot();
  // $(document).ready(function () {
  //   $('.carousel').carousel('pause');
  // })
})();


