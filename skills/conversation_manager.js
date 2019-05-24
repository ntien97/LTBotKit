resp = require("../response/response.js");
request = require("request");
sync = require('sync-request');
const CONVERSATION_MANAGER_ENDPOINT = "https://rlet-bot.herokuapp.com/api/LT-conversation-manager"
const RATING_CONVERSATION_ENDPOINT = "https://rlet-bot.herokuapp.com/api/LT-save-rating-conversation"

const ATTR_LIST = ["interior_floor", "interior_room", "legal", "orientation", "position", "realestate_type", "surrounding_characteristics", "surrounding_name", "surrounding", "transaction_type"];
const ENTITY_LIST = ["area", "location", "potential", "price", "addr_district"]
const LOCATION_ATTR_LIST = ["addr_city", "addr_street", "addr_ward", "addr_district"]

module.exports = function (controller) {

    var promiseBucket = {
        default: []
    }

    var userMessageCount = {
    }

    var isRating = {};
    var star = {};
    var appropriate = {}; // "khong_phu_hop", "hoi_thieu", "phu_hop", "hoi_du",
    var catched_intents = {}; //arr type
    var edited_intents = {}; // arr type
    var conversation = {}; // arr type

    function isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    function conductOnboarding(bot, message) {

        bot.startConversation(message, function (err, convo) {
            var id = message.user
            console.log(id)
            if (id) {
                var delete_body = sync("DELETE", CONVERSATION_MANAGER_ENDPOINT + "?graph_id=" + id);
                console.log("DELETE GRAPH CODE:" + delete_body.statusCode);
            }
            convo.say({
                text: resp.hello,
            });
            userMessageCount[id] = 0;
        });
    }

    function restartConversation(bot, message) {
        var id = message.user
        if (isRating[id] && message.save) {
            console.log("CALL SAVE API HERE")
            body = {
                star: star[id],
                appropriate: appropriate[id],
                catched_intents: catched_intents[id],
                edited_intents: edited_intents[id],
                conversation: conversation[id]
            }
            console.log(JSON.stringify(body))
            request.post(RATING_CONVERSATION_ENDPOINT, { json: body }, (err, resp, data) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(data);
                }
            })
        }
        isRating[id] = false;
        bot.reply(message, { graph: {}, text: resp.thank });
        console.log(id)
        if (id) {
            conversation[id] = [];
            var delete_body = sync("DELETE", CONVERSATION_MANAGER_ENDPOINT + "?graph_id=" + id);
            console.log("DELETE GRAPH CODE:" + delete_body.statusCode);
        }
        setTimeout(() => {
            bot.reply(message, resp.hello)
            userMessageCount[id] = 0;
        }, 1000)

    }

    function callConversationManager(bot, message) {

        var id = message.user;
        var raw_mesg = message.text
        var showCustomButton = false;
        var force_show = false;
        var remove_more = false;
        var filter_attr = false;
        var filter_all = false;
        console.log(message);
        if (raw_mesg) {
            if (conversation[message.user]) {
                conversation[message.user].push("user: " + raw_mesg );
            } else {
                conversation[message.user] = ["user: " + raw_mesg];
            }
        }
        if (message.rating_prop) {
            console.log(message.rating_prop)
            if (message.rating_prop.star) star[message.user] = message.rating_prop.star;
            if (message.rating_prop.appropriate) appropriate[message.user] = message.rating_prop.appropriate;
            if (message.rating_prop.catched_intents) edited_intents[message.user] = message.rating_prop.catched_intents;
            return;
        }
        if (message.continue) {
            conversation[message.user].push("bot: "+ resp.whatyourattr );
            bot.reply(message, resp.whatyourattr);
            return;
        }
        if (message.start_rating) {
            isRating[message.user] = true;
            star[message.user] = -1;
            appropriate[message.user] = "phu_hop"; // "khong_phu_hop", "hoi_thieu", "phu_hop", "hoi_du"
            catched_intents[message.user] = message.catched_intents;
            edited_intents[message.user] = message.catched_intents;
            conversation[message.user].push("bot: "+  resp.start_rating );
            bot.reply(message, {
                text: resp.start_rating,
                start_rating: true,
                catched_intents: catched_intents[message.user],
                force_result: [
                    {
                        title: 'Save',
                        payload: {
                            'quit': true,
                            'save': true
                        }
                    },
                    {
                        title: 'Cancel',
                        payload: {
                            'quit': true,
                            'save': false
                        },
                    },
                ]
            });
            return;
        }
        if (message.quit) {
            restartConversation(bot, message);
            return;
        }
        if (message.force_show) {
            force_show = true;
            raw_mesg = "";
        }
        if (message.remove_more) {
            remove_more = true;
            force_show = true;
            raw_mesg = "";
        }
        if (message.clearAttr) {

            // sync.delete(CONVERSATION_MANAGER_ENDPOINT + "?graph_id=" + id + "&new_node=" + message.clearAttr.key, (error, res, body) => {
            //     console.log(body)
            // })
            var delete_body = sync("DELETE", CONVERSATION_MANAGER_ENDPOINT + "?graph_id=" + id + "&new_node=" + message.clearAttr.key);
            console.log("DELETE GRAPH KEY [" + message.clearAttr.key + "] CODE:" + delete_body.statusCode);

            showCustomButton = true;
            raw_mesg = "";
        }
        if (message.filterAttr) {
            filter_attr = true;
            force_show = true;
            raw_mesg = "";
        }
        if (message.filter_all) {
            filter_all = true;
            force_show = true;
            raw_mesg = "";
        }

        if (!promiseBucket[id]) {
            promiseBucket[id] = []
        }
        var bucket = promiseBucket[id]
        var pLoading = { value: true };
        bucket.push(pLoading)

        function requestGET() {
            pLoading.value = false;
            if (bucket.every(ele => { return ele.value === false })) {
                // + "&force_get_results=true"
                var postfix_force_show = "";
                if (force_show === true) {
                    postfix_force_show = "&force_get_results=true"
                }
                if (filter_attr === true) {
                    postfix_force_show += "&key_filter=" + message.filterAttr.key + "&value_filter=" + message.filterAttr.value
                }
                if (filter_all === true) {
                    postfix_force_show += "&key_filter=all";
                }
                console.log(postfix_force_show)
                request.get(CONVERSATION_MANAGER_ENDPOINT + "?graph_id=" + id + postfix_force_show, {}, (error, res, body) => {
                    // console.log(body)
                    if (error) {
                        conversation[message.user].push("bot: "+ resp.err );
                        bot.reply(message, {
                            graph: graph,
                            text: resp.err
                        })
                        return
                    }
                    try {
                        response_body = JSON.parse(body);
                        console.log("***")
                        console.log(JSON.stringify(response_body));
                        var graph = response_body.graph;
                        // bot.reply(message, {
                        //     graph: graph
                        // })
                        console.log("***")
                        if (promiseBucket[id].every(ele => { return ele.value === false })) {
                            bucket = []
                            promiseBucket[id] = []
                            if (response_body.initial_fill == false) {
                                conversation[message.user].push("bot: " + response_body.question);
                                bot.reply(message, {
                                    text: response_body.question
                                })
                            } else
                                if (response_body.has_results === true) {
                                    // có kết quả, trả lời được rồi
                                    if (response_body.result_container.length == 0 || remove_more === true) {
                                        // nếu container không có gì hoặc người dùng muốn xóa bớt attr
                                        // show các attr đang có để xóa
                                        var list = []
                                        var mentioned_attributes = response_body.mentioned_attributes;

                                        for (var i = 0; i < mentioned_attributes.length; i++) {
                                            (function (ele) {
                                                if (ATTR_LIST.indexOf(ele) != -1 || (ele !== "addr_district" && ele !== "location" && ENTITY_LIST.indexOf(ele) != -1)) {
                                                    if (graph[ele] && graph[ele].value_raw) {
                                                        var arr = graph[ele].value_raw;
                                                        if (arr.length > 0) {
                                                            var value = arr[0]
                                                            for (var j = 1; j < arr.length; j++) {
                                                                value += ", " + arr[j]
                                                            }
                                                            list.push({ value: value, key: ele });
                                                        }
                                                    }
                                                }
                                                if (LOCATION_ATTR_LIST.indexOf(ele) != -1) {
                                                    if (graph["location"][ele] && graph["location"][ele].value_raw) {
                                                        var arr = graph["location"][ele].value_raw;
                                                        if (arr.length > 0) {
                                                            var value = arr[0]
                                                            for (var j = 1; j < arr.length; j++) {
                                                                value += ", " + arr[j]
                                                            }
                                                            list.push({ value: value, key: ele });
                                                        }
                                                    }
                                                }
                                            })(mentioned_attributes[i]);
                                        }
                                        if (list && list.length > 0) {
                                            conversation[message.user].push("bot: " +resp.cantfind );
                                            bot.reply(message, {
                                                text: resp.cantfind,
                                                attr_list: list,
                                                graph: graph,
                                            })
                                        } else {
                                            conversation[message.user].push("bot: " +resp.wetried );
                                            bot.reply(message, { graph: graph, text: resp.wetried })
                                        }

                                    } else {
                                        // for result_container != []
                                        // show kết quả 
                                        if (response_body.intent_values_container && !isEmpty(response_body.intent_values_container)) {
                                            conversation[message.user].push("bot: " +resp.showall );
                                            bot.reply(message, {
                                                text: resp.showall,
                                                intent_dict: response_body.intent_values_container,
                                                graph: graph,
                                                force_result: [
                                                    {
                                                        title: 'Được rồi, cảm ơn!',
                                                        payload: {
                                                            'start_rating': true,
                                                            'catched_intents': graph.current_intents
                                                        }
                                                    },
                                                    {
                                                        title: 'Có',
                                                        payload: {
                                                            'filter_all': true,
                                                        },
                                                    },
                                                ]
                                            })
                                        } else {
                                            console.log(response_body.result_container)
                                            conversation[message.user].push("bot: " + (response_body.intent_response ? response_body.intent_response : "Kết quả của bạn: ") );
                                            conversation[message.user].push("bot: " + "Bạn có muốn thêm yêu cầu gì không?" );
                                            bot.reply(message, {
                                                text: [response_body.intent_response ? response_body.intent_response : "Kết quả của bạn: ", "Bạn có muốn thêm yêu cầu gì không?"],
                                                show_results: response_body.result_container,
                                                concerned_attributes: response_body.concerned_attributes,
                                                graph: graph,
                                                force_result: [
                                                    {
                                                        title: 'Có',
                                                        payload: {
                                                            'continue': true
                                                        },
                                                    },
                                                    {
                                                        title: 'Được rồi, cảm ơn!',
                                                        payload: {
                                                            'start_rating': true,
                                                            'catched_intents': graph.current_intents
                                                        }
                                                    }
                                                ]
                                            })
                                        }
                                    }

                                } else {
                                    // chưa trả lời được do số doc còn nhiều
                                    if (showCustomButton) { // show nút bấm cho người dùng
                                        conversation[message.user].push("bot: " + response_body.question);
                                        bot.reply(message, {
                                            text: response_body.question,
                                            graph: graph,
                                            force_result: [
                                                {
                                                    title: 'Bỏ tiếp yêu cầu',
                                                    payload: {
                                                        'remove_more': true
                                                    },
                                                },
                                                {
                                                    title: 'In luôn kết quả',
                                                    payload: {
                                                        'force_show': true
                                                    }
                                                }
                                            ]
                                        })
                                    }
                                    else {
                                        // lấy câu hỏi lại rồi hỏi người dùng
                                        if (userMessageCount[id] > 3) {
                                            conversation[message.user].push("bot: " + response_body.question);
                                            bot.reply(message, {
                                                graph: graph,
                                                text: response_body.question,
                                                force_result: [
                                                    {
                                                        title: 'In luôn kết quả',
                                                        payload: {
                                                            'force_show': true
                                                        }
                                                    }
                                                ]
                                            })
                                        } else {
                                            if (userMessageCount[id]) {
                                                userMessageCount[id] += 1;
                                            } else {
                                                userMessageCount[id] = 1;
                                            }
                                            console.log("userMessageCount: ", userMessageCount[id])
                                            conversation[message.user].push("bot: " + response_body.question);
                                            bot.reply(message, {
                                                graph: graph,
                                                text: response_body.question
                                            })
                                        }
                                    }
                                }
                        }
                    } catch (e) {
                        conversation[message.user].push("bot: "+ resp.err );
                        bot.reply(message, {
                            graph: graph,
                            text: resp.err
                        })
                    }
                })
            } else {
                console.log(bucket)
                console.log(JSON.stringify(promiseBucket))
            }
        }

        if (raw_mesg && raw_mesg.length > 0) {
            request.post(CONVERSATION_MANAGER_ENDPOINT, {
                json: {
                    graph_id: message.user,
                    message: raw_mesg
                }
            }, (error, res, body) => {
                if (error) {
                    console.log(error);
                    conversation[message.user].push("bot: "+ resp.err );
                    bot.reply(message, {
                        graph: {},
                        text: resp.err
                    })
                    return
                }
                console.log("FILL: " + JSON.stringify(body));
                requestGET()
            })
        } else {
            requestGET()
        }
    }

    controller.on('hello', conductOnboarding);
    controller.on('welcome_back', conductOnboarding);
    controller.on('message_received', callConversationManager);

}
