<template>
    <el-dropdown-item v-if="isDropdown && !hasIcon">
        <span>
            {{ $t(`${actionName}`) }}
        </span>
        <el-button type="primary" class="actionFunction" @click="updateAction(action, dialogType)"> {{ $t(`${buttonName}`) }}
        </el-button>
    </el-dropdown-item>
    <el-dropdown-item v-else-if="isDropdown && hasIcon">
        <span>
            <i :class="`${className}`" aria-hidden="true" :style="`color:${color}`"></i>
        </span>
        <span class="actionFunction" @click="updateAction(action, dialogType)">{{ $t(`${buttonName}`) }}</span>
    </el-dropdown-item>
    <li v-else>
        <span>
            {{ $t(`${actionName}`) }}
        </span>
        <el-button type="primary" class="actionFunction" @click="updateAction(action, dialogType)"> {{ $t(`${buttonName}`) }}
        </el-button>
    </li>
</template>

<script>
export default {
    props: {
        buttonName: String,
        actionName: String,
        action: String,
        dialogType: String,
        isDropdown: Boolean,
        hasIcon: Boolean,
        className: String,
        color: String
    },
    emits: ["runAction"],
    data() {
        return {};
    },
    methods: {
        updateAction(action, dialogType) {
            this.$emit("runAction", action, dialogType);
        }
    },
    mounted() {}
};
</script>

<style lang="scss" scoped>
.actionFunction {
    margin-left: 10px;
}
</style>
