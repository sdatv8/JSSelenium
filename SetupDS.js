const {Builder, By, Key, until} = require('selenium-webdriver')
const { Client } = require('pg')

const Chrome = require('selenium-webdriver/chrome')
const { elementIsDisabled, elementLocated } = require('selenium-webdriver/lib/until')
const options = new Chrome.Options().addArguments('ignore-certificate-errors')
const driver = new Builder().forBrowser('chrome').setChromeOptions(options).build()
driver.manage().window().maximize()
// 
async function ConnectDS(){
	try{
		await driver.get('https://localhost:11000/v2')
		await driver.wait(until.elementLocated(By.xpath('//h2[text()="Log in to Your Account"]')), 5000)
		await driver.findElement(By.xpath('//*[@data-input-name="login"]')).sendKeys('admin')
		await driver.findElement(By.xpath('//*[@data-input-name="password"]')).sendKeys('')
		await driver.findElement(By.xpath('//button')).click()
	}
	catch{
		console.log('Error connect DS')
		await driver.quit()
	}
}

async function DBPostgresql(){
	let LogicalName = await driver.wait(until.elementLocated(By.xpath('//label[text()="Logical Name"]/following-sibling::div//input')), 5000)
	// LogicalName.clear()
	LogicalName.sendKeys(Key.CONTROL, 'a')
	LogicalName.sendKeys(Key.BACK_SPACE)
	LogicalName.sendKeys('PostgreSQL-Selenium')
	await driver.findElement(By.xpath('//label[text()="Database Type"]/..//div[contains(@class,"Select--single")]')).click()
	await driver.findElement(By.xpath('//div[@class="Select-menu-outer"]//*[text()="PostgreSQL"]')).click()
	
	await driver.findElement(By.xpath('//label[text()="Hostname or IP"]/following-sibling::div//input')).sendKeys('192.168.1.108')
	let Port = await driver.findElement(By.xpath('//label[text()="Port"]/following-sibling::div//input'))
	Port.sendKeys('\b\b\b\b')
	Port.sendKeys('54121')
	await driver.findElement(By.xpath('//label[text()="Default Login"]/following-sibling::div//input')).sendKeys('postgres')
	await driver.findElement(By.xpath('//label[text()="Password"]/following-sibling::div//input')).sendKeys('1234')
	await driver.findElement(By.xpath('//label[text()="Save Password"]/..//div[contains(@class,"Select--single")]')).click()
	await driver.findElement(By.xpath('//div[@class="Select-menu-outer"]//*[text()="Save in "]')).click()
	await driver.findElement(By.xpath('//*[text()="Test"]/parent::button')).click()
	let TestConnection
	try{
		await driver.wait(until.elementLocated(By.xpath('//div[contains(text(),"Success")]')), 5000).getText().then(function(txt){
			TestConnection = txt
		});
		return (TestConnection)
	}
	catch{
		await driver.wait(until.elementLocated(By.xpath('//div[contains(text(),"Error")]')), 5000).getText().then(function(txt){
			TestConnection = txt
		});
		return (TestConnection)
	}
	
}

async function AddInstance(){
	try{
		await driver.wait(until.elementLocated(By.xpath('//span[text()="Configuration"]/parent::button[@class="menu__item-link"]')), 5000).click()
		await driver.findElement(By.xpath('//span[text()="Configuration"]/parent::button[@class="menu__item-link"]')).click()
		await driver.wait(until.elementLocated(By.xpath('//a[@class="wrapper-button "]//button')), 5000).click()
		let dbCheck = await DBPostgresql()
		if (dbCheck == 'Success'){
			await driver.findElement(By.xpath('//*[text()="Save"]/parent::button')).click()
			try{
				await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"PostgreSQL-Selenium")]')), 50000)
			}
			catch{
				console.log('Error create instance!')
				await driver.quit()
			}
		} else {
			console.log('Error message: ' + dbCheck)
			await driver.quit()
		}
	}
	catch{
		console.log('Not connect DS')
	}
}

async function AddMaskingRule(){
	try{
		await driver.wait(until.elementLocated(By.xpath('//*[text()="Masking"]/parent::button')), 5000).click()
		await driver.findElement(By.xpath('//*[text()="Add Rule"]')).click()
		await driver.findElement(By.xpath('//label[text()="Name"]/following-sibling::div//input')).sendKeys('PostgreSQL-Selenium')
		await driver.findElement(By.xpath('//label[text()="Instance"]/..//div[contains(@class,"Select--single")]')).click()
		await driver.findElement(By.xpath('//div[@class="Select-menu-outer"]//*[contains(text(),"PostgreSQL-Selenium")]')).click()
		await driver.findElement(By.xpath('//div[text()="Columns to Mask"]/following-sibling::div//button')).click()
		try{
			await driver.wait(until.elementLocated(By.xpath('//div[text()="spetrov"]/preceding-sibling::div//button')), 5000).click()
			await driver.wait(until.elementLocated(By.xpath('//div[text()="public"]/preceding-sibling::div//button')), 5000).click()
			await driver.wait(until.elementLocated(By.xpath('//div[text()="mock_data"]/preceding-sibling::div//button')), 5000).click()
			await driver.wait(until.elementLocated(By.xpath('//div[text()="first_name"]/preceding-sibling::div//div')), 5000).click()
			await driver.wait(until.elementLocated(By.xpath('//div[text()="last_name"]/preceding-sibling::div//div')), 5000).click()
			await driver.findElement(By.xpath('//span[text()="Done"]/parent::button')).click()
			await driver.wait(until.elementLocated(By.xpath('//button[@class="tree-database-view__name col-flex"]')), 5000)
			await driver.findElement(By.xpath('//label[text()="Masking Method"]/..//div[contains(@class,"Select--single")]')).click()
		}
		catch{
			console.log('Not find table in database')
			await driver.quit()
		}
		try{
			await driver.findElement(By.xpath('//label[text()="Masking Method"]/..//div[contains(@class,"Select--single")]')).click()
			await driver.findElement(By.xpath('//div[@class="Select-menu-outer"]//div[contains(text(),"Mask first chars")]')).click()
			await driver.findElement(By.xpath('//label[text()="Character Count"]/following-sibling::div//input')).sendKeys('\b')
			await driver.findElement(By.xpath('//label[text()="Character Count"]/following-sibling::div//input')).sendKeys('2')
			await driver.findElement(By.xpath('//span[text()="Save Rule"]/parent::button')).click()
		}
		catch{
			console.log('Error saved')
			await driver.quit()
		}
	}
	catch{
		await driver.quit()
		return 0
	} 

}

async function CheckProxy(){
	try{
		await driver.wait(until.elementLocated(By.xpath('//span[text()="Configuration"]/parent::button[@class="menu__item-link"]')), 5000).click()
		await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"PostgreSQL-Selenium")]/../preceding-sibling::button')), 5000).click()
		await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"PostgreSQL-Selenium")]/../../../../../..//*[contains(text(),"Active")]')), 50000)
		return ('Active')
	} catch {
		await driver.quit()
		return ('not proxy')
	}
}

async function DeleteInstance(){
	await driver.wait(until.elementLocated(By.xpath('//span[text()="Configuration"]/parent::button[@class="menu__item-link"]')), 5000).click()
	await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"PostgreSQL-Selenium")]/../../../../../..//*[@class="checkbox__square"]')), 5000).click()
	await driver.findElement(By.xpath('//div[@class="dropdown__toggle-arrow"]')).click()
	await driver.findElement(By.xpath('//ul[@class="dropdown__menu"]//*[text()="Delete"]')).click()
	await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Delete DB Instance")]')), 5000)
	await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Yes")]')), 5000).click()
}

async function DataBaseConnect(db_host,db_port){
	const client = new Client({
		user:'postgres',
		host:db_host,
		database:'spetrov',
		password:'1234',
		port:db_port,
	});

	try {
        await client.connect();      // gets connection
        const { rows } = await client.query('SELECT * FROM public.mock_data');
		return (rows)
    } catch (error) {
        console.error(error.stack);
    } finally {
        await client.end();          // closes connection
    }
}

async function CompareTable(){
	let table_origin = await DataBaseConnect('192.168.1.108', '54121')
	let table_proxy = await DataBaseConnect('192.168.10.108', '5433')
	let len = JSON.stringify(table_origin).split('},{').length
	let iter
	let count = 0
	for (let i = 0; i <= len; i++){
		for (iter in table_origin[i]){
			if ((table_origin[i][iter] != table_proxy[i][iter]) && (iter == 'first_name' || iter == 'last_name')){
				if (((table_proxy[i][iter]).slice(0, 2) == '**') && ((table_proxy[i][iter]).slice(2) == (table_origin[i][iter]).slice(2)))
					count++
				else
					break
			}
		}
	}

	if (count == len * 2)
		console.log('Success masking')
	else
		console.log('Error masking')
}

async  function StartRule(){
	try{
		await ConnectDS()
		await AddInstance()
		try{
			await AddMaskingRule()
			if (await CheckProxy() == 'Active')
				await CompareTable()
		}
		finally{
			await DeleteInstance()
			await driver.quit()
		}
	}
	catch {
		await driver.quit()
	}
}

StartRule()