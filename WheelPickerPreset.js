let dt = new Date();
let str = "";
let s = "";
for(let i = 0; i <= dt.getYear() + 30; i++) {
    if(i == dt.getYear()) s += `<option selected>${1900 + i}</option>`;
    else s += `<option>${1900 + i}</option>`;
}
str += `<select>${s}</select>`;
s = "";
for(let i = 0; i < 12; i++) {
    if(i == dt.getMonth()) s += `<option selected>${1 + i}</option>`;
    else s += `<option>${1 + i}</option>`;
}
str += `<select infinite>${s}</select>`;
s = "";
for(let i = 1; i <= 31; i++) {
    if(i == dt.getDate()) s += `<option selected>${i}</option>`;
    else s += `<option>${i}</option>`;
}
str += `<select infinite>${s}</select>`;
WheelPickerPreset['date'] = str;