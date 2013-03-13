setwd("/Users/raulfoo/Desktop")

dat = read.table("BudgetUS_Cleaned.txt",sep=",",stringsAsFactors=F)
workDat=dat
#workDat[,2] = paste(temp[,2],temp[,1],sep=",")
#workDat[,3] = paste(temp[,3],temp[,2],temp[,1],sep=",")
#workDat[,4] = paste(temp[,4],temp[,3],temp[,2],temp[,1],sep=",")
#workDat[,5] = paste(temp[,5],temp[,4],temp[,3],temp[,2],temp[,1],sep=",")

#---IMPORTANT---
#here is where we can change specificty
#with all levels, payment at program level has to be traced back to the subfunction, which can lead to some weird numbers sometimes, if only start this on workDat[,3], leaving out the subfunction nesting, then will have more generalized (and maybe better) numbers. (but will need to retain the first subfunction rows so the search will be connected) Also, if change the --> connector, need to change code at bottom of search_programs library


workDat[,2] = paste(dat[,1],dat[,2],sep="-->")
workDat[,3] = paste(dat[,1],dat[,2],dat[,3],sep="-->")
workDat[,4] = paste(dat[,1],dat[,2],dat[,3],dat[,4],sep="-->")
#workDat[,5] = paste(temp[,5],temp[,4],temp[,3],temp[,2],temp[,1],sep=",")


uniqueSearch = c()
thresholds = c()
for(i in c(1:4)){
	
	uniqueSearch = c(uniqueSearch,unique(workDat[,i]))
	thresholds = rbind(thresholds,c(i,length(uniqueSearch)))
	#take the measurement before add the ids
	if(i == 3) searchLength = length(uniqueSearch)
} 

uniqueSearch = gsub("\\(","--",uniqueSearch)
uniqueSearch = gsub("\\)","--",uniqueSearch)


thresholds = cbind(thresholds,c("subfunction","agency","bureau","program"))


branchAddresses = c()
for(j in 1:searchLength){
	
	search_r = which(as.numeric(thresholds[,2])>=j)[1]
	searchRange = c(((as.numeric(thresholds[search_r,2]))+1),as.numeric(thresholds[search_r+1,2]))
	
	
	branchMap = grep(uniqueSearch[j],uniqueSearch)
	branchMapSelect = which(branchMap>=searchRange[1] & branchMap<=searchRange[2])
	branchMap = branchMap[branchMapSelect]
	branchMap = paste(branchMap,collapse=",")
	branchAddresses = rbind(branchAddresses,branchMap)

	if(j %% 250 == 0) print(j)
}

#uniqueIds Column
uniqueIds = c(1:length(uniqueSearch))

#Browse names (last entry in the unqiueSearch)
browseNames = c()
base_level = c()
index = 0
for(i in uniqueSearch){
	splits = strsplit(i,"-->")[[1]]
	splitLength = length(splits)
	thisBaseLevel = thresholds[splitLength,3]
	browseWord = splits[splitLength]
	browseNames = c(browseNames,browseWord)
	base_level = c(base_level,thisBaseLevel)
	
	if(index %% 250 == 0) print(index)
	index = index+1
	
	

	
}

#searchable (only the first 80 entries)
trueSearch = rep("t",times=thresholds[1,2])
falseSearch = rep("f",times=(length(uniqueSearch)-length(trueSearch)))

searchables = c(trueSearch,falseSearch)


#text search (same as searchables for now)
textSearch = rep("t",times=length(searchables))


#setup BranchId column
#add zero values to branchMap for the account levels
zeroes = rep(0, times=(length(uniqueSearch)-searchLength))
branchAddressesAddColumn = c(branchAddresses,zeroes)

#add account Ids for the lowest level, 0 for the others
accountIds = c()
for(j in uniqueSearch){
	searchIndex = which(workDat[,4]==j)
	if(length(searchIndex)>0){
		value = workDat[searchIndex,5]
		
	}else{
		
		value = 0
	}
	if(length(value)>1) {
		print("greater than 1..")
		print(j)
		print(value)
	}	
	accountIds = c(accountIds,value)
	
	
}

#base_level = rep("NA",times=length(uniqueSearch))


#columns are (7)
#1 unique search ID
#2 search name, including all super levels
#3 search name used for browsing (lowest level)
#4 boolean, is this used for the first selection option
#5 boolean, can this be searched with text (all the lowest levels, and the aggregates)
#6 branches, unique search ids that are connected one level below this entry
#7 trunks (parents) the 1 unique search value that can be associated with every branch
#8 govt account ID numbers that comprise this entry (only for the aggregates and lowest levels)
#9 sort value(for sorting in the browse window, aggregates get 1 and 2, everythin else is 0)
#10 base level agency

trunkIds = rep(0,rep=length(uniqueSearch))




sortValues = rep(0,times=length(uniqueSearch))
output = cbind(uniqueIds,uniqueSearch,browseNames,searchables,textSearch,branchAddressesAddColumn,trunkIds,accountIds,sortValues,base_level)


for(trunkIndex in c(1:nrow(output))){
	branches = as.numeric(strsplit(output[trunkIndex,6],",")[[1]])
	output[branches,7] = trunkIndex
}

for(addStems in c(1:nrow(output))){
	
	if(as.numeric(output[addStems,7])==0){
		output[addStems,7] = output[addStems,1]
		
	}
	
}


outputRowIndex = 1

originalLength = nrow(output)
for(k in 1:originalLength ){
	search = output[k,6]
	rows = as.numeric(strsplit(search,",")[[1]])
	
	branchList = c(rows)
	maxIndex = 10
	indexCount = 1
	if(rows!=0 && length(rows)>0){
		while(T){
			testBranch = c()
			rowSearch = output[rows,6]
			for(eachRow in rowSearch){
				
				rowStep = as.numeric(strsplit(eachRow[[1]],",")[[1]])
				
				branchList = c(branchList,rowStep)
				testBranch = c(testBranch,rowStep)
				}
				
			if(max(testBranch)==0) break
			
			if(indexCount >= maxIndex) break
				
			 #failsafe
			indexCount = indexCount+1
			rows = testBranch
		}
		
		account_ids = rows[which(rows>0)]
		account_ids = output[account_ids,8]
	}else{
		account_ids = 0
		}
	#create 'All' entry
	if(outputRowIndex <= searchLength){
		#trunkIndex = as.numeric(output[outputRowIndex,7])
		trunkIndex = outputRowIndex
		unique_id = nrow(output)+1
		
		browseName = paste(output[outputRowIndex,3]," (All -- Total)",sep="")
		allLevelName = browseName
		baseLevelCategory = output[outputRowIndex,10]
		
        #for the subfunction level only aggregates, need to make the trunkIndex = 0
        if(output[outputRowIndex,10]=="subfunction") trunkIndex = 0  
        
		rowOutput = c(unique_id,allLevelName,browseName,"f","f",0,trunkIndex,paste("All",paste(account_ids,collapse=","),sep=","),1,baseLevelCategory)
		output = rbind(output,rowOutput)
		
		#trunkIndex = as.numeric(output[outputRowIndex,7])
		trunkIndex = outputRowIndex

		unique_id = nrow(output)+1
		browseName = paste(output[outputRowIndex,3]," (All -- List)",sep="")
		allLevelName = browseName
		
		

		rowOutput = c(unique_id,allLevelName,browseName,"f","f",0,trunkIndex,paste(account_ids,collapse=","),2,baseLevelCategory)
		output = rbind(output,rowOutput)
		
		#add these two to the branch Ids for the origianl search
		output[outputRowIndex,6] = paste((nrow(output)-1),nrow(output),output[outputRowIndex,6],sep=",")
		#if need to, add the account ids to this row as well, but shouldn't need too, as only will be accesses
	
		output[outputRowIndex,8] = paste(account_ids,collapse=",")
		#output[outputRowIndex,10] = baseLevelCategory
	
	}
	
	
	outputRowIndex = outputRowIndex +1
	if((outputRowIndex %% 100) == 0) print(outputRowIndex)
		
	
}	

write.table(output,"uniqueSearches.txt",sep=",",col.names=F,row.names=F)

allNests = c()

workOutput = output[1:originalLength,]
for(nest in c(2:4)){
	nestingValues = c()
	for(i in c(1:originalLength)){
		search = workOutput[i,2]
		levels = strsplit(search,"-->")[[1]]
		if(length(levels) < nest){
			nestingValues = rbind(nestingValues,workOutput[i,8])
			next
		}else{
			
			newSearch = levels[nest:length(levels)]
			rebuild = paste(newSearch,collapse="-->")
			matches = grep(rebuild,workOutput[,2])
			allAccountIds = workOutput[matches,8]
			
			cumulative = c()
			for(k in allAccountIds){
				temp = strsplit(k,",")[[1]]
				templist = c()
				for(z in temp){
					templist = c(templist,as.numeric(z))
					}
				cumulative = c(cumulative,templist)#paste(cumulative,k,sep=",")
			}
			#then check for duplicates, remove and rebuild the string
			#checkUniques = strsplit(cumulative,",")[[1]]
			uniques = unique(cumulative)
			rebuild = paste(uniques,collapse=",")
			nestingValues = rbind(nestingValues,rebuild)
		}
		if((i %% 250) == 0) print(paste("Nest:",nest,", row: ",i,sep=""))
	}
	allNests =  cbind(allNests,nestingValues)
}

allNestsTemp = array(dim=c((nrow(output)-nrow(allNests)),3),0)  #this is to cover all the aggregates
#move account Ids to end
allNests = rbind(allNests,allNestsTemp)
output = cbind(output[,-8],output[,8])
output = cbind(output,allNests)

write.table(output,"uniqueSearches.txt",sep=",",col.names=F,row.names=F)

#nesting levels, 1 = default, fully nested, 2 = nested to two programs above, 3 = nested to program immediately above, 4 = no nesting, so, the higher the nest the number, the more account ids there should be associated with it
#so, allNests should be a originalLengthx3 array, where the first column = account ids to use when they search for a nesting level of 2, second column is nesting level of 3