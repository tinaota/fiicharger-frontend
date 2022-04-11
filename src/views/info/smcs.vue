<template>
  <div class="scroll">
    <div class="mainctrl">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>{{ $t("menu.information") }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ $t("menu.fmcs") }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="card-8 report">
        <div class="filter">
          <el-date-picker
            v-model="filter.dateRange"
            type="daterange"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd"
            range-separator="-"
            :start-placeholder="$t('general.startDate')"
            :end-placeholder="$t('general.endDate')"
            :picker-options="pickerOptions"
            :clearable="true"
            @change="updateApi()"
          >
          </el-date-picker>
        </div>
        <div class="tabs-contain">
          <el-tabs v-model="active" @tab-click="handleTabClick">
            <el-tab-pane :label="$t('menu.costRevenue')" name="costRevenue">
            </el-tab-pane>
            <!-- <el-tab-pane
              :label="$t('menu.costRevenueDay')"
              name="costRevenueDay"
            >
            </el-tab-pane>
            <el-tab-pane
              :label="$t('menu.costRevenueNight')"
              name="costRevenueNight"
            >
            </el-tab-pane>
            <el-tab-pane :label="$t('menu.energyPhm')" name="energyPhm">
            </el-tab-pane> -->
          </el-tabs>
          <FMCSTemplate
            v-if="active === 'costRevenue'"
            :url="costRevenueUrl"
          ></FMCSTemplate>
          <FMCSTemplate
            v-if="active === 'costRevenueDay'"
            :url="costRevenueDayURl"
          ></FMCSTemplate>
          <FMCSTemplate
            v-if="active === 'costRevenueNight'"
            :url="costRevenueNightURL"
          ></FMCSTemplate>
          <FMCSTemplate
            v-if="active === 'energyPhm'"
            :url="energyPhmURL"
          ></FMCSTemplate>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { setScrollBar } from "@/utils/function";
import FMCSTemplate from "@/components/info/fmcsTemplate";
import moment from "moment";

const baseGrafanaUrl = process.env.VUE_APP_GRAFANA_BASE_URL;

var costRevenueUrl =
  `${baseGrafanaUrl}/LtfWzay7k/topview?orgId=1&kiosk&refresh=1m&theme=light`;
var costRevenueDayURl =
  `${baseGrafanaUrl}/yp-R2617k/cost-and-revenue-day-scenario-demo?orgId=1&kiosk&refresh=1m&theme=light`;
var costRevenueNightURL =
  `${baseGrafanaUrl}/JBTcTkb7k/cost-and-revenue-night-scenario?orgId=1&kiosk&refresh=1m&theme=light`;
var energyPhmURL =
  `${baseGrafanaUrl}/EEcCuCA7k/energy-and-phm?orgId=1&kiosk&refresh=1m&theme=light`;

export default {
  components: {
    FMCSTemplate,
  },
  data() {
    return {
      active: "costRevenue",
      costRevenueUrl: costRevenueUrl,
      costRevenueDayURl: costRevenueDayURl,
      costRevenueNightURL: costRevenueNightURL,
      energyPhmURL: energyPhmURL,
      filter: {
        dateRange: [],
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
      },
    };
  },
  created() {
    const todaySplit = moment().format("YYYY-MM-DD").split("-");
    const thisMonth1st = todaySplit[0] + "-" + todaySplit[1] + "-01";

    if (todaySplit[2] === "01") {
      this.filter.dateRange = [thisMonth1st, thisMonth1st];
    } else {
      const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");
      this.filter.dateRange = [thisMonth1st, yesterday];
    }
    this.updateGrafanaUrl();
  },
  mounted() {
    setScrollBar(".scroll", this);
  },
  methods: {
    handleTabClick(tab, event) {},
    updateApi() {
      this.updateGrafanaUrl();
    },
    updateGrafanaUrl() {
      let startDate = this.filter.dateRange[0];
      let endDate = this.filter.dateRange[1];
      startDate = moment(startDate).format("x");
      endDate = moment(endDate).format("x");
      if (this.active === "costRevenue") {
        this.costRevenueUrl =
          costRevenueUrl + `&from=` + startDate + `&to=` + endDate;
      } else if (this.active === "costRevenue") {
        this.costRevenueDayURl =
          costRevenueDayURl + `&from=` + startDate + `&to=` + endDate;
      } else if (this.active === "costRevenueNight") {
        this.costRevenueNightURL =
          costRevenueNightURL + `&from=` + startDate + `&to=` + endDate;
      } else if (this.active === "energyPhm") {
        this.energyPhmURL =
          energyPhmURL + `&from=` + startDate + `&to=` + endDate;
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang = "scss" scoped>
.mainctrl .card-8 {
  padding: 28px;
  width: calc(100% - 56px);
  position: relative;
}
</style>
