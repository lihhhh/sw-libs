/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

var event = function (name, source, type) {
    this.active = true;
    this.name = name;
    this.source = source;
    this.type = type;
}


event.prototype = {
    $destroy() {
        this.active = false;
    },
    $transfor(wxevent) {
        let k = 0;
        for (k in wxevent) {
            this[k] = wxevent[k];
        }
    }
}


export default event;
