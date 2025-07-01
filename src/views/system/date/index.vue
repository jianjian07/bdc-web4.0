<template>
  <div class="date-manage">
    <div class="date-content">
      <div class="date-calendar">
        <a-calendar v-model:value="value" @panelChange="onPanelChange" :validRange="validRange">
          <template #headerRender="{ value: current, type, onChange, onTypeChange }">
            <a-row type="flex" justify="space-between">
              <a-col style="display: flex">
                <a-select
                    size="small"
                    :dropdown-match-select-width="false"
                    class="my-year-select"
                    :value="String(current.year())"
                    @change="
                    newYear => {
                      onChange(current.year(+newYear));
                      onYearChange(current, newYear)
                    }
                  "
                >
                  <a-select-option
                      v-for="val in getYears(current)"
                      :key="String(val)"
                      class="year-item"
                  >
                    {{ val }}
                  </a-select-option>
                </a-select>
                <a-tag style="margin-left: 10px;line-height: 22px" color="blue">当前选择: {{
                    value.format('YYYY-MM-DD')
                  }}
                </a-tag>

              </a-col>
              <a-col>
                <a-button @click="handleToday" size="small" style="margin-right: 10px">今天</a-button>
                <a-select
                    size="small"
                    :dropdown-match-select-width="false"
                    :value="String(current.month())"
                    @change="
                    selectedMonth => {
                      currentMonth = current.month(parseInt(String(selectedMonth), 10)).format('MM')
                      onChange(current.month(parseInt(String(selectedMonth), 10)));
                    }
                  "
                >
                  <a-select-option
                      v-for="(val, index) in getMonths(current)"
                      :key="String(index)"
                      class="month-item"
                  >
                    {{ val }}
                  </a-select-option>
                </a-select>
              </a-col>
            </a-row>
          </template>
          <template #dateFullCellRender="{ current }">
            <div
                :class="['cell-date-custom',getWeekendClass(current), getIsNotCurrentMonthClass(current), getHolidayOrWorkdayClass(current)]">
              <div :class="['cell-date-value']">
                {{ current.date() }}
              </div>
              <div class="cell-date-panel">
                <div class="cell-date-text">
                  {{ getDayText(current) }}
                </div>
                <div v-if="workdayFlag && !getIsNotCurrentMonthClass(current) && getWeekendClass(current)"
                     class="cell-date-check">
                  <a-checkbox :checked="workdays.includes(current.format('YYYY-MM-DD'))"
                              @change="(event) => onChangeCheckbox(event, 'workday', current)">班
                  </a-checkbox>
                </div>
                <div v-if="holidayFlag && !getIsNotCurrentMonthClass(current)" class="cell-date-check">
                  <a-checkbox :checked="holidays.includes(current.format('YYYY-MM-DD'))"
                              @change="(event) => onChangeCheckbox(event, 'holiday', current)">休
                  </a-checkbox>
                </div>
              </div>

              <div v-if="getHolidayOrWorkdayClass(current)"
                   :class="['cell-date-flag', getHolidayOrWorkdayClass(current)]">
                {{ getHolidayOrWorkdayClass(current) == 'holiday' ? '休' : '班' }}
              </div>

            </div>

          </template>
        </a-calendar>
      </div>
      <div class="date-form">
        <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
          <a-form-item label="上班时间">
            <a-time-picker v-model:value="currentData.onTime"
                           format="HH:mm"
                           valueFormat="HH:mm"
                           :disabledHours="disabledStartHours"
                           :disabledMinutes="disabledStartMinutes"
                           :hideDisabledOptions="true">
            </a-time-picker>
          </a-form-item>
          <a-form-item label="下班时间">
            <a-time-picker v-model:value="currentData.offTime"
                           format="HH:mm"
                           valueFormat="HH:mm"
                           :disabledHours="disabledEndHours"
                           :disabledMinutes="disabledEndMinutes"
                           :hideDisabledOptions="true">
            </a-time-picker>
          </a-form-item>
          <a-form-item label="工作时长">
            <a-input-number :min="0" v-model:value="currentData.workHours"
                            :formatter="value => `${value} 小时`"
                            :parser="value => value.replace(' 小时', '')"
                            disabled>
            </a-input-number>
          </a-form-item>
          <a-form-item label="节假日">
            <a-button v-if="holidayFlag" @click="completeDay('holiday')">完成设置</a-button>
            <a-button v-else @click="setDay('holiday')">设置节假日</a-button>
          </a-form-item>
          <a-form-item label="工作日">
            <a-button v-if="workdayFlag" @click="completeDay('workday')">完成设置</a-button>
            <a-button v-else @click="setDay('workday')">设置工作日</a-button>
          </a-form-item>
        </a-form>
        <div style="text-align: center">
          <a-button type="primary" @click="saveData">保存</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { Lunar, Solar, HolidayUtil } from 'lunar-javascript'
import dayjs from "dayjs"
import { message } from "ant-design-vue"
import { defHttp } from "/@/utils/http/axios"
import { useUserStore } from "/@/store/modules/user.ts"
// 当前年份
let currentYear = ref<any>()
// 当前月份
let currentMonth = ref<any>()
// 当前展示日期
let value = ref<any>(dayjs())
// 当前年份相关信息
let currentData = ref<any>({
  onTime: '',
  offTime: '',
  holidayDay: '',
  workingDay: '',
  workHours: 0,
  year: ''
})
// 节假日
let holidays = ref<any>([])
// 工作日
let workdays = ref<any>([])
// 设置节假日flag
let holidayFlag = ref<any>(false)
// 设置工作日flag
let workdayFlag = ref<any>(false)

enum api {
  info = '/api/zrzy-system/extsys/sysDate/queryByYear',
  save = '/api/zrzy-system/extsys/sysDate/addOrEdit'
}

const validRange = computed(() => {
  return [
    dayjs(`${currentYear.value}-01-01 00:00:00`),
    dayjs(`${currentYear.value}-12-31 23:59:59`),
  ]
})

watch(() => currentData.value.onTime, (value) => {
  if (currentData.value.offTime && currentData.value.onTime) {
    currentData.value.workHours = dayjs(currentData.value.offTime, 'HH:mm').diff(dayjs(currentData.value.onTime, 'HH:mm'), 'minute') / 60
  } else {
    currentData.value.workHours = 0
  }
})

watch(() => currentData.value.offTime, (value) => {
  if (currentData.value.offTime && currentData.value.onTime) {
    currentData.value.workHours = dayjs(currentData.value.offTime, 'HH:mm').diff(dayjs(currentData.value.onTime, 'HH:mm'), 'minute') / 60
  } else {
    currentData.value.workHours = 0
  }
})

onMounted(() => {
  currentYear.value = dayjs().format('YYYY')
  currentMonth.value = dayjs().format('MM')
  initData()
})

function initData() {
  if (isSetFinish()) {
    resetCurrentData()
    workdays.value = []
    holidays.value = []
    currentData.value.year = currentYear.value
    defHttp.get({ url: api.info, params: { year: currentYear.value } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        if (res.result) {
          currentData.value = {
            ...res.result,
            holidayDay: res.result.holidayDay ?? initDefaultDay('holiday'),
            workingDay: res.result.workingDay ?? initDefaultDay('workday')
          }
        } else {
          initDefaultDay('holiday')
          initDefaultDay('workday')
        }
      } else {
        message.warning(res?.message || '查询失败')
      }
    })
  }
}

/**
 * 重置
 */
function resetCurrentData() {
  currentData.value = {
    onTime: '',
    offTime: '',
    holidayDay: '',
    workingDay: '',
    workHours: 0,
    year: ''
  }
}

/**
 * 加载默认的节日
 * @param type
 */
function initDefaultDay(type) {
  if (type === 'workday') {
    const work = HolidayUtil.getHolidays(currentYear.value).filter(h => h.isWork())
    currentData.value.workingDay = work.map((item) => item.getDay()).join(',')
  } else {
    const holiday = HolidayUtil.getHolidays(currentYear.value).filter(h => !h.isWork())
    currentData.value.holidayDay = holiday.map((item) => item.getDay()).join(',')
  }
}

/**
 * 获取月份
 * @param value
 */
const getMonths = (value) => {
  const localeData = value.localeData()
  const months: any = []
  for (let i = 0; i < 12; i++) {
    months.push(localeData.monthsShort(value.month(i)))
  }
  return months
}

/**
 * 获取年份
 * @param value
 */
const getYears = (value) => {
  const year = value.year()
  const years:any = []
  for (let i = year - 10; i < year + 10; i += 1) {
    years.push(i)
  }
  return years
}

/**
 * 年份更改
 * @param current
 * @param newYear
 */
function onYearChange(current, newYear) {
  currentYear.value = current.year(+newYear).format('YYYY')
  initData()
}

/**
 * 面板改变
 * @param value
 * @param mode
 */
function onPanelChange(value, mode) {
  currentMonth.value = value.format('MM')
}

/**
 * 获取周末class
 * @param current
 */
function getWeekendClass(current) {
  if (current.day() === 0 || current.day() === 6) {
    return 'cell-date-custom-weekend'
  }
  return ''
}

/**
 * 看是否是当前月
 * @param current
 */
function getIsNotCurrentMonthClass(current) {
  if (current.format('MM') !== currentMonth.value) {
    return 'cell-date-custom-not-current-month'
  } else {
    return ''
  }
}

/**
 * 获取节假日或工作日class
 * @param current
 */
function getHolidayOrWorkdayClass(current) {
  let format = current.format('YYYY-MM-DD')
  let holidays = currentData.value.holidayDay.split(',')
  let workdays = currentData.value.workingDay.split(',')
  if (holidays.includes(format)) {
    return 'holiday'
  } else if (workdays.includes(format)) {
    return 'workday'
  } else {
    return ''
  }
}

/**
 * 设置节假日
 */
function setDay(type) {
  workdays.value = currentData.value.workingDay.split(',')
  holidays.value = currentData.value.holidayDay.split(',')
  if (type === 'workday') {
    if (holidayFlag.value) {
      message.warning('请先完成节假日设置!')
      return
    }
    workdayFlag.value = true
  } else {
    if (workdayFlag.value) {
      message.warning('请先完成工作日设置!')
      return
    }
    holidayFlag.value = true
  }
}

/**
 * 完成设置
 * @param type
 */
function completeDay(type) {
  currentData.value.workingDay = workdays.value.join(',')
  currentData.value.holidayDay = holidays.value.join(',')
  if (type === 'workday') {
    workdayFlag.value = false
  } else {
    holidayFlag.value = false
  }
}

/**
 * 勾选框
 * @param event
 * @param type
 * @param current
 */
function onChangeCheckbox(event, type, current) {
  let checked = event.target.checked
  workdays.value = workdays.value.filter(item => item !== current.format('YYYY-MM-DD'))
  holidays.value = holidays.value.filter(item => item !== current.format('YYYY-MM-DD'))
  console.log('checked',checked)
  if (checked) {
    if (type === 'workday') {
      workdays.value.push(current.format('YYYY-MM-DD'))
    } else {
      holidays.value.push(current.format('YYYY-MM-DD'))
    }
  }
}

/**
 * 优先级显示函数，按照节气 > 传统节日 > 公历节日 > 农历日期
 * @param date
 */
function getDayText(date) {
  const solar = Solar.fromDate(date.toDate())
  const lunar = solar.getLunar()

  // 按优先级获取显示内容
  const jieQi = lunar.getJieQi()
  if (jieQi) return jieQi

  const lunarFestivals = lunar.getFestivals()
  if (lunarFestivals.length > 0) return lunarFestivals[0]

  const solarFestivals = solar.getFestivals()
  if (solarFestivals.length > 0) return solarFestivals[0]

  return lunar.getDayInChinese()
}

/**
 * 计算禁用开始时间小时
 */
function disabledStartHours() {
  if (currentData.value.offTime) {
    let hours = []
    let hour = Number.parseInt(currentData.value.offTime.substring(0, 2))
    for (let i = hour + 1; i < 24; i++) {
      hours.push(i)
    }
    return hours
  }
}

/**
 * 计算禁用开始时间分钟
 * @param selectedHour
 */
function disabledStartMinutes(selectedHour) {
  if (currentData.value.offTime) {
    let minutes: any = []
    let hour = Number.parseInt(currentData.value.offTime.substring(0, 2))
    let minute = Number.parseInt(currentData.value.offTime.slice(-2))
    if (selectedHour >= hour) {
      for (let i = minute + 1; i < 60; i++) {
        minutes.push(i)
      }
    }
    return minutes
  }
}

//计算禁用结束时间小时
function disabledEndHours() {
  if (currentData.value.onTime) {
    let hours = []
    let hour = Number.parseInt(currentData.value.onTime.substring(0, 2))
    for (let i = 0; i < hour; i++) {
      hours.push(i)
    }
    return hours
  }
}

//计算禁用结束时间分钟
function disabledEndMinutes(selectedHour) {
  if (currentData.value.onTime) {
    let minutes = []
    let hour = Number.parseInt(currentData.value.onTime.substring(0, 2))
    let minute = Number.parseInt(currentData.value.onTime.slice(-2))
    if (selectedHour <= hour) {
      for (let i = 0; i < minute; i++) {
        minutes.push(i)
      }
    }
    return minutes
  }
}

/**
 * 是否设置完毕
 */
function isSetFinish() {
  if (holidayFlag.value) {
    message.warning('请先完成节假日设置!')
    return false
  }
  if (workdayFlag.value) {
    message.warning('请先完成工作日设置!')
    return false
  }
  
  return true
}

/**
 * 今天
 */
function handleToday() {
  if (isSetFinish()){
    value.value = dayjs()
    currentYear.value = dayjs().format('YYYY')
    currentMonth.value = dayjs().format('MM')
    initData()
  }
}

/**
 保存
 */
function saveData() {
  if (isSetFinish()) {
    if (!currentData.value.id) {
      currentData.value.createTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
      currentData.value.createBy = useUserStore().getUserInfo.username
    } 
    currentData.value.updateTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
    currentData.value.updateBy = useUserStore().getUserInfo.username
    defHttp.post({ url: api.save, data: currentData.value }, { withToken: true }).then((res) => {
      if (res && res.success) {
        message.success('保存成功!')
        initData()
      } else {
        message.warning(res?.message || '保存失败!')
      }
    })
  }
}
</script>

<style scoped lang="less">
.date-manage {
  width: 100%;

  .date-header {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .date-content {
    //height: calc(100% - 56px);
    display: flex;

    .date-calendar {
      width: 70%;
      padding: 20px 20px 10px 20px;

      :deep(.ant-picker-cell-today) {
        .cell-date-custom {
          background-color: #e6f4ff;
          border-color: #1677ff;

          .cell-date-value {
            color: #1677ff;
          }

          .cell-date-text {
            color: #1677ff;
          }
        }
      }

      :deep(.ant-picker-cell-selected) {
        .cell-date-custom {
          background-color: #e6f4ff!important;
        }
      }

      .cell-date-custom-weekend {
        .cell-date-value, .cell-date-text {
          color: red;
        }
      }

      .cell-date-custom.holiday {
        background-color: rgba(235, 51, 51, .05);

        .cell-date-value, .cell-date-text {
          color: red;
        }
      }

      .cell-date-custom.workday {
        .cell-date-value, .cell-date-text {
          color: rgba(0, 0, 0, 0.88);
        }
      }

      .cell-date-flag.workday {
        .cell-date-text, .cell-date-value {
          color: rgba(0, 0, 0, 0.88)
        }
      }

      .cell-date-custom-weekend.cell-date-custom-not-current-month.workday {
        .cell-date-text, .cell-date-value {
          color: rgba(0, 0, 0, 0.25)
        }
      }

      .cell-date-custom-weekend.cell-date-custom-not-current-month {
        .cell-date-value {
          color: rgba(255, 0, 0, 0.25);
        }

        .cell-date-text {
          color: rgba(255, 0, 0, 0.25);
        }
      }


      .cell-date-custom {
        position: relative;
        display: block;
        width: auto;
        height: auto;
        margin: 0 4px;
        padding: 4px 8px 0;
        border: 0;
        border-top: 2px solid rgba(5, 5, 5, 0.06);
        border-radius: 0;
        transition: background 0.3s;

        .cell-date-value {
          line-height: 24px;
          transition: color 0.3s;
          font-size: 18px;
        }

        .cell-date-text {
          position: static;
          width: auto;
          min-height: 46px;
          color: rgba(0, 0, 0, 0.88);
          overflow-y: auto;
          line-height: 1.5714285714285714;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 15px;
        }

        .cell-date-panel {
          min-height: 71px;
        }

        .cell-date-check {
          height: 25px;
          display: flex;
          justify-content: center;
        }
      }

      .cell-date-flag {
        position: absolute;
        top: 6px;
        left: 10px;
        width: 20px;
        height: 20px;
        text-align: center;
      }

      .cell-date-flag.holiday {
        background-color: red;
        color: #fff;
      }

      .cell-date-flag.workday {
        background-color: #4e5877;
        color: #fff;
      }

      .cell-date-custom-not-current-month {
        .cell-date-flag.holiday {
          background-color: rgba(255, 0, 0, 0.25);
        }

        .cell-date-flag.workday {
          background-color: rgba(78, 88, 119, 0.25);
        }

        .cell-date-text {
          color: rgba(0, 0, 0, 0.25);
        }
      }
    }

    .date-form {
      width: 30%;
      padding: 20px;
      border-left: 2px solid #e9ebf1;
      display: flex;
      flex-direction: column;
      align-content: center;
    }
  }
}
</style>