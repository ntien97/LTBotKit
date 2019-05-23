var converter = new showdown.Converter();
converter.setOption('openLinksInNewWindow', true);
const RESULT_MESSAGE_WIDTH_TRANS = 310;
const price_formatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'VND'
})
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
const norm2vn = {
  '1': 'quận 1',
  '2': 'quận 2',
  '3': 'quận 3',
  '4': 'quận 4',
  '5': 'quận 5',
  '6': 'quận 6',
  '7': 'quận 7',
  '8': 'quận 8',
  '9': 'quận 9',
  '10': 'quận 10',
  '11': 'quận 11',
  '12': 'quận 12',
  'thu duc': 'quận Thủ Đức',
  'go vap': 'quận Gò Vấp',
  'binh thanh': 'quận Bình Thạnh',
  'tan binh': 'quận Tân Bình',
  'tan phu': 'quận Tân Phú',
  'phu nhuan': 'quận Phú Nhuận',
  'binh tan': 'quận Bình Tân',
  'cu chi': 'huyện Củ Chi',
  'hoc mon': 'huyện Hóc Môn',
  'binh chanh': 'huyện Bình Chánh',
  'nha be': 'huyện Nhà Bè',
  'can gio': 'huyện Cần Giờ',
  'ba dinh': 'quận Ba Đình',
  'hoan kiem': 'quận Hoàn Kiếm',
  'hai ba trung': 'quận Hai Bà Trưng',
  'dong da': 'quận Đống Đa',
  'tay ho': 'quận Tây Hồ',
  'cau giay': 'quận Cầu Giấy',
  'thanh xuan': 'quận Thanh Xuân',
  'hoang mai': 'quận Hoàng Mai',
  'long bien': 'quận Long Biên',
  'tu liem': 'huyện Từ Liêm',
  'thanh tri': 'huyện Thanh Trì',
  'gia lam': 'huyện Gia Lâm',
  'dong anh': 'huyện Đông Anh',
  'soc son': 'huyện Sóc Sơn',
  'ha dong': 'quận Hà Đông',
  'son tay': 'Thị xã Sơn Tây',
  'ba vi': 'huyện Ba Vì',
  'phuc tho': 'huyện Phúc Thọ',
  'thach that': 'huyện Thạch Thất',
  'quoc oai': 'huyện Quốc Oai',
  'chuong my': 'huyện Chương Mỹ',
  'dan phuong': 'huyện Đan Phượng',
  'hoai duc': 'huyện Hoài Đức',
  'thanh oai': 'huyện Thanh Oai',
  'my duc': 'huyện Mỹ Đức',
  'ung hoa': 'huyện Ứng Hoà',
  'thuong tin': 'huyện Thường Tín',
  'phu xuyen': 'huyện Phú Xuyên',
  'me linh': 'huyện Mê Linh',
  "kinh doanh":"kinh doanh",
  "o":"làm chỗ ở",
  "cho thue":"cho thuê",
  "van phong":"làm văn phòng",
  "cong ty":"làm công ty",
  "dau tu":"đầu tư",
  "spa":"mở spa",
  "lam van phong":"làm văn phòng",
  "buon ban":"buôn bán",
  "khach san":"làm khách sạn",
  "mo van phong":"mở văn phòng",
  "can ho dich vu":"làm căn hộ dịch vụ",
  "nha hang":"mở nhà hàng",
  "showroom":"mở showroom",
  "kd":"kinh doanh",
  "kd ks":"kinh doanh khách sạn",
  "shop":"mở shop",
  "thue":"thuê",
  "cty":"làm công ty",
  "ngan hang":"làm ngân hàng",
  "shop thoi trang":"mở shop thời trang",
  "cafe":"mở quán cafe",
  "cua hang":"mở cửa hàng",
  "quan an":"làm quán ăn",
  "mua ban":"mua bán",
  "kinh doanh online":"kinh doanh online",
  "truong hoc":"làm trường học",
  "tham my vien":"mở thẩm mỹ viện",
  "thoi trang":"mở shop thời trang",
  "tru so cong ty":"làm trụ sở công ty",
  "vp":"làm văn phòng",
  "can ho":"làm căn hộ",
  "nha khoa":"mở nha khoa",
  "cao oc":"làm cao ốc",
  "phong kham":"mở phòng khám",
  "ban lai":"bán lại",
  "lam vp":"làm văn phòng",
  "trung tam dao tao":"mở trung tâm đào tạo",
  "tra sua":"mở quán trà sửa",
  "xay cao oc":"xây cao ốc",
  "van phong dai dien":"mở văn phòng đại diện",
  "xay khach san":"xây khách sạn",
  "ca phe":"mở quán cafe",
  "sieu thi":"kinh doanh siêu thị",
  "ban hang online":"bán hàng online",
  "xay tro":"xây nhà trọ",
  "quan cafe":"mở quán cafe",
  "mo vp":"mở văn phòng",
  "salon toc":"mở salon tóc",
  "trung tam anh ngu":"mở trung tâm anh ngữ",
  "xay moi":"xay mới",
  "chdv":"mở căn hộ dịch vụ",
  "nail":"mở tiệm nail",
  "cong ty chuyen phat nhanh":"mở công ty chuyển phát nhanh",
  "phong mach":"mở phòng mạch",
  "kd online":"kinh doanh online",
  "dinh cu":"để định cư",
  "mo cong ty":"mở công ty",
  "mo spa":"mở spa",
  "online":"mở shop online",
  "lam spa":"mở spa",
  "trung tam ngoai ngu":"mở trung tâm ngoại ngữ",
  "ban online":"bán hàng online",
  "an uong":"mở quán ăn uống",
  "dich vu":"mở quán dịch vụ",
  "phong tro":"xây phòng trọ",
  "kd nha hang":"kinh doanh nhà hàng",
  "toa nha":"mở toà nhà",
  "mo vpct":"mở văn phòng công ty",
  "xay dung":"xây dựng",
  "tham my":"mở thẩm mỹ viện",
  "coffee":"mở quán cafe",
  "nha xuong":"xây nhà xưởng",
  "sieu thi mini":"làm siêu thị mini",
  "day hoc":"mở trung tâm dạy học",
  "quan nhau":"mở quán nhậu",
  "nha tre":"mở nhà trẻ",
  "xay biet thu":"xây biệt thự",
  "nha thuoc":"mở nhà thuốc",
  "lop hoc":"mở trung tâm dạy học",
  "salon":"mở salon",
  "nghi duong":"xây nghỉ dưỡng",
  "my pham":"mở shop mỹ phẩm",
  "xuong may":"xây xưởng máy",
  "nha tro":"xây nhà trọ",
  "kho":"xây kho",
  "noi that":"mở shop nội thất",
  "vpcty":"mở văn phòng công ty",
  "xay phong tro":"xây phòng trọ",
  "lam showroom":"làm showroom",
  "quan ca phe":"mở quán cafe",
  "karaoke":"mở quán karaoke",
  "xay nha tro":"xây nhà trọ",
  "lam kho":"làm nhà kho",
  "xay van phong":"xây văn phòng",
  "tiem toc":"mở tiệm tóc",
  "villa biet thu":"xây villa biệt thự",
  "studio":"mở studio",
  "shop online":"mở shop online",
  "kho xuong":"xây kho xưởng",
  "lam vpct":"làm văn phòng công ty",
  "xay nha":"xây nhà",
  "xay can ho dich vu":"xây căn hộ dịch vụ",
  "tap hoa":"mở tạp hóa",
  "lam van phong cty":"làm văn phòng công ty",
  "sinh song":"sinh sống",
  "vpct":"lam văn phòng công ty",
  "toa nha van phong":"làm tòa nhà văn phòng",
  "mo shop":"mở shop",
  "in theu":"mở shop in thêu",
  "ks":"mở khách sạn",
  "lam vpcty":"làm văn phòng công ty",
  "benh vien":"gần bệnh viện",
  "nha nghi":"mở nhà nghỉ",
  "lam cong ty":"làm công ty",
  "truong hoc quoc te":"gần trường học công tế",
  "biet thu":"mở biệt thự",
  "kdoanh online":"kinh doanh online",
  "mat bang":"thuê mặt bằng",
  "lam nha hang":"mở nhà hàng",
  "phong gym":"mở phòng gym",
  "mo truong":"mở trường",
  "vp cong ty":"làm văn phòng công ty",
  "tiem thuoc":"mở tiệm thuốc",
  "vp cty":"làm văn phòng công ty",
  "mo cty":"mở công ty",
  "xay chdv":"xây căn hộ dịch vụ",
  "gym":"mở gym",
  "xay dung cao oc":"xây dựng cao ốc",
  "nha thuoc tay":"mở nhà thuốc tây",
  "mo vpcty":"mở văn phòng công ty",
  "ngan hang thue":"cho ngân hàng thuê",
  "trung tam thuong mai":"mở trung tâm thương mại",
  "mo showroom":"mở showroom",
  "xay building":"xây building",
  "kinh doanh khach san":"kinh doanh khách sạn",
  "bar":"mở bar",
  "shop quan ao":"mở shop quần áo",
  "truong mam non":"mở trường mầm non",
  "mo cua hang":"mở cửa hàng",
  "cua hang dien thoai":"mở cửa hàng điện thoại",
  "lam xuong may":"làm xưởng máy",
  "lop day hoc":"mở lớp dạy học",
  "mo nha hang":"mở nhà hàng",
  "spa lam dep":"mở spa làm đẹp",
  "lam an":"làm ăn",
  "building van phong":"mở building văn phòng",
  "chua hang":"chứa hàng",
  "kinh doanh cafe":"kinh doanh cafe",
  "trung tam day hoc":"mở trung tâm dạy học",
  "truong anh ngu":"mở trường anh ngữ",
  "xay dung khach san":"xây dựng khách sạn",
  "vp - cty":"làm văn phòng công ty",
  "homestay":"mở homestay",
  "yoga":"mở trung tâm yoga",
  "can ho dv":"làm căn hộ dịch vụ",
  "lam khach san":"làm khách sạn",
  "kho chua hang":"làm kho chứa hàng",
  "kd onl":"kinh doanh online",
  "mo quan cafe":"mở quán cafe",
  "xay lai":"xây lại",
  "dinh van phong":"làm văn phòng",
  "dich vu an uong":"làm dịch vụ ăn uống",
  "mo quan an":"mở quán ăn",
  "showroom trung bay":"mở showroom trưng bày",
  "xay o":"xây ở",
  "shop hoa":"mở shop hoa",
  "khach thue":"cho khách thuê",
  "truong tu thuc":"mở trường tư thục",
  "mo phong mach":"mở phòng mạch",
  "xay dung van phong":"xây dựng văn phòng",
  "trung bay san pham":"trưng bày sản phẩm",
  "tiem thuoc tay":"mở tiệm thuốc tây",
  "lam may":"làm xưởng may",
  "ban hang onl":"bán hàng online",
  "mo quan":"mở quán",
  "mam non":"mở trường mầm non",
  "san xuat":"sản xuất",
  "lam chdv":"làm căn hộ dịch vụ",
  "lam cafe":"làm quán cafe",
  "mo van phong cty":"mở văn phòng công ty",
  "vphong":"làm văn phòng",
  "cong ty chuyen phat":"mở công ty chuyển phát",
  "kinh doanh spa":"kinh doanh spa",
  "xay dung building":"xây dựng building",
  "kdbb":"kinh doanh buôn bán",
  "kho hang":"làm kho hàng",
  "lam tai san":"làm tài sản",
  "tiem vang":"mở tiệm vàng",
  "ao cuoi":"mở tiệm áo cưới",
  "buon ban online":"buôn bán online",
  "massage":"mở tiệm massage",
  "show room":"mở show room",
  "mo truong hoc":"mở trường học",
  "o gd":"ở gia đình",
  "gdinh kdoanh online":"kinh doanh online",
  "xay toa nha":"xây tòa nhà",
  "lam cty":"làm công ty",
  "mo phong kham":"mở phòng khám",
  "mo tiem":"mở tiệm"
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
  rating_count: 0,
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
    // console.log("here")
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
      // console.log('CONNECT WITH USER', user);
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
      // console.log('CONNECTED TO SOCKET');
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
      // console.error('ERROR', event);
    });

    that.socket.addEventListener('close', function (event) {
      // console.log('SOCKET CLOSED!');
      that.trigger('disconnected', event);
      if (that.reconnect_count < that.config.max_reconnect) {
        setTimeout(function () {
          // console.log('RECONNECTING ATTEMPT ', ++that.reconnect_count);
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
    // console.log(message)
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
            // // console.log($(id).find(".content"))
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
    if (message.start_rating) {
      if (!that.next_line) {
        that.next_line = document.createElement('div');
        that.message_list.appendChild(that.next_line);
      }
      message.ratingId = this.rating_count;
      this.rating_count += 1;
      that.next_line.innerHTML = that.message_rating_template({
        message: message
      });
      if (message.text) {
        var filler = document.getElementById("rating-mask-" + message.ratingId);
        var t = $(`<div class="message">${message.text}</div>`)[0];
        var s = $(`<div class="message">
        <span class="span_bold">Độ phù hợp của kết quả:</span>
        <select class="select" id="appropriate_selector_${message.ratingId}">
          <option value="khong_phu_hop">Không phù hợp</option>
          <option value="hoi_thieu">Hơi thiếu kết quả</option>
          <option value="phu_hop" selected>Phù hợp</option>
          <option value="hoi_du">Hơi dư kết quả</option>
        </select> </br>
        <span class="span_bold">Bạn đã yêu cầu:</span> </br>
          <input type="checkbox" value="real_estate" id="real_estate_${message.ratingId}">Tìm bất động sản</input> </br>
          <input type="checkbox" value="price" id="price_${message.ratingId}">Hỏi về giá</input> </br>
          <input type="checkbox" value="area" id="area_${message.ratingId}">Hỏi về diện tích</input> </br>
          <input type="checkbox" value="potential" id="potential_${message.ratingId}">Hỏi về tiềm năng</input> </br>
          <input type="checkbox" value="location" id="location_${message.ratingId}">Hỏi về địa điểm</input> </br>
          <input type="checkbox" value="addr_district" id="addr_district_${message.ratingId}">Hỏi về quận</input> </br>
          <input type="checkbox" value="other" id="other_${message.ratingId}">Không nằm trong các lựa chọn trên</input> </br>
        <span class="span_bold">Độ hài lòng:</span>
        <div class="rating">
          <a href="javascript:;" class="rating__button" href="#"><svg class="rating__star">
              <use xlink:href="#star"></use>
            </svg></a>
          <a href="javascript:;" class="rating__button" href="#"><svg class="rating__star">
              <use xlink:href="#star"></use>
            </svg></a>
          <a href="javascript:;" class="rating__button" href="#"><svg class="rating__star">
              <use xlink:href="#star"></use>
            </svg></a>
          <a href="javascript:;" class="rating__button" href="#"><svg class="rating__star">
              <use xlink:href="#star"></use>
            </svg></a>
          <a href="javascript:;" class="rating__button" href="#"><svg class="rating__star">
              <use xlink:href="#star"></use>
            </svg></a>
        </div> </br>
        </div>`)[0];
        filler.appendChild(t);
        filler.appendChild(s);
        for (var i = 0; i < message.catched_intents.length; i++) {
          (function (ele) {
            $(`#${ele}_${message.ratingId}`).attr('checked', true);
          })(message.catched_intents[i]);
        }
        $(`#rating-mask-${message.ratingId} input`).change(() => {
          var arr = $(`#rating-mask-${message.ratingId} input`);
          var edited_intents = [];
          for (var i = 0; i < arr.length; i++) {
            (function (ele) {
              if (ele.is(':checked')) edited_intents.push(ele.val());
            })($(arr[i]));
          }
          var anotherThat = that;
          anotherThat.deliverMessage({
            type: 'message',
            rating_prop: {
              catched_intents: edited_intents
            },
            user: that.guid,
            channel: that.options.use_sockets ? 'socket' : 'webhook'
          });
        })
        $(`#appropriate_selector_${message.ratingId}`).change(() => {
          const appropriate_selector = $(`#appropriate_selector_${message.ratingId}`).val();
          var anotherThat = that;
          anotherThat.deliverMessage({
            type: 'message',
            rating_prop: {
              appropriate: appropriate_selector
            },
            user: that.guid,
            channel: that.options.use_sockets ? 'socket' : 'webhook'
          });
        })
        $('.rating__button').on('click', function (e) {
          var $t = $(this), // the clicked star
            $ct = $t.parent(); // the stars container

          // add .is--active to the user selected star 
          $t.siblings().removeClass('is--active').end().toggleClass('is--active');
          // add .has--rating to the rating container, if there's a star selected. remove it if there's no star selected.
          $ct.find('.rating__button.is--active').length ? $ct.addClass('has--rating') : $ct.removeClass('has--rating');

          // sent start
          var anotherThat = that;
          anotherThat.deliverMessage({
            type: 'message',
            rating_prop: {
              star: ($t.index() % 5) + 1
            },
            user: that.guid,
            channel: that.options.use_sockets ? 'socket' : 'webhook'
          });
        });
      }
      if (!message.isTyping) {
        delete (that.next_line);
      }
    } else {
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

              // // console.log(message.intent_dict)
              var count = 0;
              if (message.intent_dict["location"]) count += 1;
              if (message.intent_dict["addr_district"]) count += 1;
              if (message.intent_dict["potential"]) count += 1;
              var showOptions = true;
              if (count > 1) showOptions = false;
              var filler = document.getElementById("intent-mask-" + message.intentListId);

              // // console.log(filler);

              if (message.intent_dict["price"]) {
                var txt = "";
                var obj = message.intent_dict["price"];
                if (obj.response && obj.value) {
                  txt += obj.response + " " + price_formatter.format(obj.value);
                  
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
              console.log(message.intent_dict);
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
                      var li = $(`<div class="attr" lt-key="${key}" lt-value="${ele}"">${norm2vn[ele] ?norm2vn[ele] : ele}</div>`)[0];
                      $(li).click(() => {
                        var key = $(li).attr("lt-key");
                        if (key == "location") {
                          key = "addr_district";
                        }
                        var value = $(li).attr("lt-value");

                        var anotherThat = that;

                        var response = "Xem kết quả với " + key2vn[key] + ": \"" + $(li).text() + "\"";
                        var message = {
                          type: 'outgoing',
                          text: response
                        };
                        // // console.log(that)
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

                        // console.log($($(li).parent()[0]).find(".attr"))
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
                      txt += (norm2vn[obj.value[i]] ? norm2vn[obj.value[i]] :  obj.value[i]) + ", "
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
              console.log(message.intent_dict);
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
                    // // console.log(that)
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

                    // console.log($($(li).parent()[0]).find(".attr"))
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
            // console.log(filler);
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
                  // // console.log(that)
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

                  // console.log($($(li).parent()[0]).find(".attr"))
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
            // console.log(parentDiv);
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
          // console.log(a_left)
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
        Botkit.triggerScript(event.data.script, event.data.thread);
        break;
      case 'identify':
        Botkit.identifyUser(event.data.user);
        break;
      case 'connect':
        Botkit.connect(event.data.user);
        break;
      default:
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
    console.log("RESULT");
    console.log(results);
    console.log(concerned_attributes);
    for (var r = 0; r < len; r++) {
      (function (result) {

        var title = `<div class="tittle"><a href="${result.url}" target="#">${result.tittle}</div></marquee>`
        var list_row = '';
        var count = 0;
        for (var i = 0; i < concerned_attributes.length; i++)
          if (result[concerned_attributes[i]] && count < MAX_ATTR) {
            let raw_key = concerned_attributes[i] + "_raw";
            if (concerned_attributes[i] === "interior_floor" || concerned_attributes[i] === "interior_room") {
              raw_key = concerned_attributes[i];
            }
            if (concerned_attributes[i] === "orientation" & result[concerned_attributes[i]] === "Không xác định") {
              continue;
            }
            if (concerned_attributes[i] === "addr_district" || concerned_attributes[i] === "potential") {
              continue;
            }
            count += 1;
            var val = result[raw_key] ? result[raw_key] : result[concerned_attributes[i]]
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

    var custom_source_4 = document.getElementById('message_rating_template').innerHTML;
    that.message_rating_template = Handlebars.compile(custom_source_4);

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
              that.sendCustom(reply.title, reply.payload);
            }

            li.appendChild(el);
            list.appendChild(li);
            elements.push(li);

          })(message.force_result[r]);
        }

        that.replies.appendChild(list);

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
      that.parent_window = window.parent;
      window.addEventListener("message", that.receiveCommand, false);
      that.sendEvent({
        type: 'event',
        name: 'booted'
      });

    } else {
      that.connect(user);
    }

    return that;
  }
};


(function () {
  Botkit.boot();
})();


