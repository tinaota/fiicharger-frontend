<template>
    <div class="pricingUsage">
        <div class="pricingUsageType">
            <div class="label">{{ $t('general.type') }}<span style="color:red"><strong>* </strong></span></div>
            <el-radio-group v-model="pricingUsageType" @change="updateData">
                <el-radio-button v-for="item in pricingUsageTypeList" :label="item.value" :key="item.value">{{ item.name!=='reservation'? $t(`general.${item.name}`) : $t(`chargingStation.${item.name}`) }}</el-radio-button>
            </el-radio-group>
        </div>
        <div class="reservationOptions" v-if="pricingUsageType==='RESERVATION'">
            <div class="item">
                <el-tooltip :content="$t('general.reservationUsageTooltip')" placement="top">
                    <i class="fa fa-info-circle" aria-hidden="true"></i>
                </el-tooltip>
                <label>{{ $t('general.reservationUsage') }}</label>
                <el-select class="autoresizeselect" v-model="reservationUsageType" clearable filterable @change="updateData">
                    <el-option v-for="item in reservationUsageTypeList" :label="item.name!=='reservation'? $t(`general.${item.name}`) : $t(`chargingStation.${item.name}`) " :key="item.name" :value="item.value"></el-option>
                </el-select>
            </div>
            <div class="item">
                <el-tooltip :content="$t('general.reservationTypeTooltip')" placement="top">
                    <i class="fa fa-info-circle" aria-hidden="true"></i>
                </el-tooltip>
                <label>{{ $t('general.reservationType') }}</label>
                <el-select class="autoresizeselect" v-model="reservationType" clearable filterable @change="updateData">
                    <el-option v-for="item in reservationTypeList" :label="item.name" :key="item.name" :value="item.name"></el-option>
                </el-select>
            </div>
        </div>
        <div class="otherInfo">
            <div class="price">
                <div class="label">{{ $t('menu.tariff') }}<span style="color:red"><strong>* </strong></span></div>
                <div class="info">
                    <el-input-number class="inputFilter" v-model="price" :controls="false" @change="updateData"></el-input-number>
                </div>
            </div>
            <div class="vat">
                <div class="label">{{ $t('general.vat') }}(%)<span style="color:red"><strong>* </strong></span></div>
                <div class="info">
                    <el-input-number class="inputFilter" v-model="vat" :controls="false" @change="updateData"></el-input-number>
                </div>
            </div>
            <div class="stepSize">

                <div class="label">
                    <el-tooltip :content="$t('general.stepSizeToolTip')" placement="top">
                        <i class="fa fa-info-circle" aria-hidden="true"></i>
                    </el-tooltip>
                    {{ $t('general.stepSize') }}
                    <span style="color:red"><strong>* </strong></span>
                </div>
                <div class="info">
                    <el-input-number class="inputFilter" v-model="stepSize" :controls="false" @change="updateData"></el-input-number>
                </div>
            </div>
        </div>
        <!-- only allow to delete the last item -->
        <div class="actions" v-if="usageCollapseIndex===totalUsageCollapseIndex">
            <i class="fa fa-trash" aria-hidden="true" @click="deletePricingUsage"></i>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        usageCollapseIndex: Number,
        totalUsageCollapseIndex: Number,
        eachPriceComponent: Object
    },
    emits: ["emitPriceUsageData", "deletePricingUsageData"],
    data() {
        return {
            price: null,
            vat: null,
            stepSize: 1,
            pricingUsageType: "TIME",
            pricingUsageTypeList: [
                { name: "time", value: "TIME" },
                { name: "flat", value: "FLAT" },
                { name: "parkingTime", value: "PARKING_TIME" },
                { name: "energy", value: "ENERGY" },
                { name: "reservation", value: "RESERVATION" }
            ],
            reservationUsageType: "TIME",
            reservationUsageTypeList: [],
            reservationType: "RESERVATION",
            reservationTypeList: [
                { name: "RESERVATION" },
                { name: "RESERVATION_EXPIRES" }
            ]
        };
    },
    watch: {
        eachPriceComponent: function () {
            this.populateUsageData();
        }
    },
    mounted() {
        this.reservationUsageTypeList = this.pricingUsageTypeList.slice(0, 2);
        this.populateUsageData();
    },
    methods: {
        populateUsageData() {
            // if there is data is passed from edit
            if (
                this.eachPriceComponent &&
                Object.keys(this.eachPriceComponent).length > 0
            ) {
                this.price = this.eachPriceComponent.price;
                // check the condition for type
                if (!this.eachPriceComponent.isReservationTypePresent) {
                    this.pricingUsageType = this.eachPriceComponent.type;
                } else if (
                    this.eachPriceComponent.isReservationTypePresent &&
                    this.eachPriceComponent.reservationType === "RESERVATION"
                ) {
                    this.pricingUsageType = "RESERVATION";
                    this.reservationType = "RESERVATION";
                    this.reservationUsageType = this.eachPriceComponent.type;
                } else if (
                    this.eachPriceComponent.isReservationTypePresent &&
                    this.eachPriceComponent.reservationType ===
                        "RESERVATION_EXPIRES"
                ) {
                    this.pricingUsageType = "RESERVATION";
                    this.reservationType = "RESERVATION_EXPIRES";
                    this.reservationUsageType = this.eachPriceComponent.type;
                }
                this.stepSize = this.eachPriceComponent.stepSize;
                this.vat = this.eachPriceComponent.vat;
            }
            this.updateData();
        },
        deletePricingUsage() {
            this.$emit("deletePricingUsageData");
        },
        updateData() {
            let priceUsageData;
            priceUsageData = {
                // check if it reservation
                type:
                    this.pricingUsageType === "RESERVATION"
                        ? this.reservationUsageType
                        : this.pricingUsageType,
                vat: this.vat,
                stepSize: this.stepSize,
                price: this.price,
                isReservationTypePresent:
                    this.pricingUsageType === "RESERVATION",
                reservationType:
                    this.pricingUsageType === "RESERVATION"
                        ? this.reservationType
                        : null
            };
            this.$emit(
                "emitPriceUsageData",
                this.usageCollapseIndex,
                priceUsageData
            );
        }
    }
};
</script>

<style lang="scss" scoped>
.pricingUsage {
    margin-bottom: 5px;
    display: flex;
    flex-direction: column;
    width: 94%;
    padding: 0px 5px 5px 15px;
    .pricingUsageType,
    .otherInfo {
        margin-bottom: 5px;
    }
    .reservationOptions {
        display: flex;
    }
    .otherInfo {
        display: flex;
        justify-content: space-between;
        .inputFilter {
            width: 115px;
        }
    }
    .actions {
        display: flex;
        justify-content: flex-end;
        color: #0263ff;
    }
}
</style>
