const ReactWindow = require('react-window');
console.log('Full exports:', ReactWindow);
try {
    const { VariableSizeList } = require('react-window');
    console.log('VariableSizeList form require:', VariableSizeList);
} catch (e) {
    console.log('Error requiring:', e.message);
}
